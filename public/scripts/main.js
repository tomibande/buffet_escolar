// School Cafeteria System - Main JavaScript

class CafeteriaApp {
    constructor() {
        this.cart = [];
        this.user = null;
        this.menuItems = [];
        this.currentSection = 'home';
        
        this.init();
    }

    init() {
        this.loadUser();
        this.loadMenuItems();
        this.setupEventListeners();
        this.setupAnimations();
        this.updateCartDisplay();
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
            document.querySelector('.user-btn span').textContent = this.user.username;
            document.getElementById('userBalance').textContent = `$${this.user.balance || '25.50'}`;
        }
    }

    loadMenuItems() {
        // Sample menu items - in production, this would come from the API
        this.menuItems = [
            {
                id: 1,
                name: 'Chicken Sandwich',
                description: 'Grilled chicken breast with lettuce, tomato, and mayo',
                price: 4.25,
                category: 'main',
                image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400',
                available: true,
                rating: 4.5
            },
            {
                id: 2,
                name: 'Fresh Garden Salad',
                description: 'Mixed greens with cherry tomatoes, cucumbers, and dressing',
                price: 2.75,
                category: 'main',
                image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400',
                available: true,
                rating: 4.2
            },
            {
                id: 3,
                name: 'Pizza Slice',
                description: 'Classic cheese pizza with marinara sauce',
                price: 3.50,
                category: 'main',
                image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
                available: true,
                rating: 4.7
            },
            {
                id: 4,
                name: 'French Fries',
                description: 'Crispy golden fries with sea salt',
                price: 1.75,
                category: 'sides',
                image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400',
                available: true,
                rating: 4.3
            },
            {
                id: 5,
                name: 'Orange Juice',
                description: 'Fresh squeezed orange juice',
                price: 1.50,
                category: 'drinks',
                image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
                available: true,
                rating: 4.1
            },
            {
                id: 6,
                name: 'Chocolate Chip Cookie',
                description: 'Warm, freshly baked chocolate chip cookie',
                price: 1.25,
                category: 'desserts',
                image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=400',
                available: true,
                rating: 4.8
            }
        ];

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
                            Add to Cart
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
                        <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                        <span class="menu-item-status ${item.available ? 'available' : 'unavailable'}">
                            ${item.available ? 'Available' : 'Sold Out'}
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
                this.navigateToSection(section);
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

        // Menu filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.getAttribute('data-category');
                this.renderMenuItems(category);
            });
        });

        // Order tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab') + 'Orders';
                document.getElementById(tabId).classList.add('active');
            });
        });

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
            this.navigateToSection(sectionId);
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
        cartTotal.textContent = total.toFixed(2);

        // Update cart items
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <p>Add some delicious items from our menu!</p>
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
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
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
            alert('Your cart is empty!');
            return;
        }

        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.add('active');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Clear cart
            this.cart = [];
            this.updateCartDisplay();
            this.closeCart();

            // Show success modal
            this.showModal('successModal');
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred during checkout. Please try again.');
        } finally {
            loadingOverlay.classList.remove('active');
        }
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