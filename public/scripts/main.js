// School Cafeteria System - Main JavaScript

class CafeteriaApp {
    constructor() {
        this.cart = [];
        this.user = null;
        this.menuItems = [];
        this.currentSection = 'home';
        this.mp = null;
        
        this.init();
    }

    init() {
        this.loadUser();
        this.loadMenuItems();
        this.setupEventListeners();
        this.setupAnimations();
        this.updateCartDisplay();
        this.initializeMercadoPago();
    }

    initializeMercadoPago() {
        // Initialize Mercado Pago when the script loads
        if (typeof MercadoPago !== 'undefined') {
            this.mp = new MercadoPago('TEST-2429502995306401-092321-8e4364b1e9ee3c0c38c5c0967b0f6365-191149729', {
                locale: 'es-AR'
            });
            console.log('Mercado Pago initialized');
        }
    }

    loadUser() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.user = JSON.parse(userData);
            this.updateUserDisplay();
        }
    }

    updateUserDisplay() {
        if (this.user) {
            document.querySelector('.user-btn span').textContent = 'Estudiante';
        }
    }

    async loadMenuItems() {
        try {
            const response = await fetch('/api/products');
            const result = await response.json();
            if (result.success) {
                this.menuItems = result.data;
            }
        } catch (error) {
            console.error('Error loading menu items:', error);
            // Fallback to empty array
            this.menuItems = [];
        }

        this.renderMenuItems();
    }

    renderMenuItems(category = 'all') {
        const menuGrid = document.getElementById('menuGrid');
        const filteredItems = category === 'all' 
            ? this.menuItems 
            : this.menuItems.filter(item => item.category === category);

        menuGrid.innerHTML = filteredItems.map(item => `
            <div class="menu-item" data-category="${item.category}">
                <div class="menu-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    <div class="menu-item-overlay">
                        <button class="btn btn-primary" onclick="app.addToCart(${item.id})">
                            <i class="fas fa-plus"></i>
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <h3>${item.name}</h3>
                        <div class="menu-item-rating">
                            <i class="fas fa-star"></i>
                            <span>${item.rating}</span>
                        </div>
                    </div>
                    <p class="menu-item-description">${item.description}</p>
                    <div class="menu-item-footer">
                        <span class="menu-item-price">$${item.price}</span>
                        <span class="menu-item-status ${item.available ? 'available' : 'unavailable'}">
                            ${item.available ? 'Disponible' : 'Agotado'}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');

        // Animate menu items
        this.animateMenuItems();
    }

    animateMenuItems() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                if (section === 'menu') {
                    this.navigateToSection(section);
                }
            });
        });

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');
        
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        // User dropdown
        const userBtn = document.getElementById('userBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        userBtn.addEventListener('click', () => {
            userDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userBtn.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });

        // Setup menu filters after DOM is loaded
        setTimeout(() => {
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    const category = btn.getAttribute('data-category');
                    this.renderMenuItems(category);
                });
            });
        }, 100);

        // Cart functionality
        document.getElementById('cartToggle').addEventListener('click', () => {
            this.toggleCart();
        });

        document.getElementById('cartClose').addEventListener('click', () => {
            this.closeCart();
        });

        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.checkout();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Smooth scrolling for hero buttons
        window.scrollToSection = (sectionId) => {
            if (sectionId === 'menu') {
                this.navigateToSection(sectionId);
            } else if (sectionId === 'orders') {
                this.toggleCart();
            }
        };
    }

    navigateToSection(sectionId) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });

        // Smooth scroll to section
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }

        this.currentSection = sectionId;
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe sections
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });

        // Floating animation for hero cards
        this.startFloatingAnimation();
    }

    startFloatingAnimation() {
        const floatingElements = document.querySelectorAll('.floating, .floating-delayed');
        
        floatingElements.forEach((element, index) => {
            const delay = element.classList.contains('floating-delayed') ? 1000 : 0;
            
            setTimeout(() => {
                element.style.animation = `float 3s ease-in-out infinite`;
                element.style.animationDelay = `${index * 0.5}s`;
            }, delay);
        });
    }

    addToCart(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item || !item.available) return;

        const existingItem = this.cart.find(i => i.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...item, quantity: 1 });
        }

        this.updateCartDisplay();
        this.showAddToCartAnimation();
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.updateCartDisplay();
    }

    updateCartQuantity(itemId, quantity) {
        const item = this.cart.find(i => i.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                item.quantity = quantity;
            }
        }
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');

        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';

        // Update cart total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total;

        // Update cart items
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Tu carrito está vacío</p>
                    <p>¡Agrega algunos productos deliciosos de nuestro menú!</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">$${item.price}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="app.updateCartQuantity(${item.id}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="app.updateCartQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-btn" onclick="app.removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    showAddToCartAnimation() {
        const cartToggle = document.getElementById('cartToggle');
        cartToggle.classList.add('bounce');
        
        setTimeout(() => {
            cartToggle.classList.remove('bounce');
        }, 600);
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        cartSidebar.classList.toggle('active');
    }

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        cartSidebar.classList.remove('active');
    }

    async checkout() {
        if (this.cart.length === 0) {
            alert('¡Tu carrito está vacío!');
            return;
        }

        // # Mostrar modal de pago para recopilar información del cliente
        // # Esta parte abre el formulario donde el usuario ingresa sus datos
        this.showModal('paymentModal');
    }

    // # Método principal para procesar el pago con Mercado Pago
    // # Este método se ejecuta cuando el usuario completa sus datos y hace clic en "Continuar al Pago"
    async proceedToPayment() {
        // # Obtener los datos del formulario del cliente
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        
        if (!firstName || !lastName) {
            alert('Por favor completa todos los campos');
            return;
        }

        // # Cerrar el modal de información del cliente
        this.closeModal('paymentModal');
        
        // # Mostrar overlay de carga mientras se procesa
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.add('active');

        try {
            console.log('Starting checkout process...');
            
            // # Crear preferencia de pago en el backend
            // # Esta llamada envía los productos del carrito y datos del cliente al servidor
            const response = await fetch('/api/payments/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: this.cart,
                    payer: {
                        firstName,
                        lastName,
                        email: 'test@test.com'
                    }
                })
            });

            const result = await response.json();
            console.log('Preference created:', result);
            
            if (result.success) {
                // # Redirigir directamente a Mercado Pago
                // # Esta parte toma la URL de pago y redirige al usuario
                loadingOverlay.classList.remove('active');
                
                // # Usar la URL de sandbox para pruebas o init_point para producción
                const paymentUrl = result.data.sandboxInitPoint || result.data.initPoint;
                
                console.log('Redirecting to Mercado Pago:', paymentUrl);
                
                // # Guardar datos del pedido antes de redirigir
                localStorage.setItem('pendingOrder', JSON.stringify({
                    preferenceId: result.data.preferenceId,
                    customerName: `${firstName} ${lastName}`,
                    items: this.cart,
                    total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                }));
                
                // # Limpiar carrito antes de redirigir
                this.cart = [];
                this.updateCartDisplay();
                this.closeCart();
                
                // # Redirigir a Mercado Pago
                window.location.href = paymentUrl;
            } else {
                throw new Error('Error creating payment preference');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            loadingOverlay.classList.remove('active');
            alert('Ocurrió un error durante el pago. Por favor intenta nuevamente.');
        }
    }

    // # Método para crear pedidos de prueba (desarrollo)
    async createTestOrder(firstName, lastName) {
        try {
            const response = await fetch('/api/payments/create-test-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: this.cart,
                    payer: { firstName, lastName }
                })
            });
            
            const result = await response.json();
            if (result.success) {
                this.handlePaymentSuccess(firstName, lastName, result.data);
            }
        } catch (error) {
            console.error('Test order error:', error);
            alert('Error al crear el pedido de prueba');
        }
    }

    // # Método para manejar el éxito del pago
    // # Esta función se ejecuta cuando el pago se completa exitosamente
    handlePaymentSuccess(firstName, lastName, orderData = null) {
        const orderNumber = orderData ? orderData.orderNumber : Math.floor(Math.random() * 9000) + 1000;
        const estimatedTime = orderData ? orderData.estimatedTime : Math.floor(Math.random() * 20) + 10;
        
        // # Actualizar modal de éxito con los datos del pedido
        document.getElementById('orderNumber').textContent = `#${orderNumber}`;
        document.getElementById('estimatedTime').textContent = `${estimatedTime} minutos`;
        
        // # Limpiar carrito y cerrar sidebar
        this.cart = [];
        this.updateCartDisplay();
        this.closeCart();
        
        // # Ocultar contenedor de wallet y mostrar modal de éxito
        document.getElementById('wallet_container').style.display = 'none';
        this.showModal('orderSuccessModal');
        
        console.log('Payment completed successfully');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/api/auth/login';
    }
}

// Global functions
window.closeModal = (modalId) => {
    app.closeModal(modalId);
};

window.proceedToPayment = () => {
    app.proceedToPayment();
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CafeteriaApp();
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
        40%, 43% { transform: translateY(-10px); }
        70% { transform: translateY(-5px); }
        90% { transform: translateY(-2px); }
    }
    
    .bounce {
        animation: bounce 0.6s ease-in-out;
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);