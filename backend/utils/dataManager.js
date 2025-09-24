const fs = require('fs');
const path = require('path');

class DataManager {
  constructor() {
    this.productsPath = path.join(__dirname, '../data/products.json');
    this.salesPath = path.join(__dirname, '../data/sales.json');
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  // Products methods
  loadProducts() {
    try {
      if (fs.existsSync(this.productsPath)) {
        const data = fs.readFileSync(this.productsPath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  saveProducts(products) {
    try {
      fs.writeFileSync(this.productsPath, JSON.stringify(products, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving products:', error);
      return false;
    }
  }

  addProduct(product) {
    const products = this.loadProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      ...product,
      available: true,
      rating: 0
    };
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  updateProduct(id, updateData) {
    const products = this.loadProducts();
    const productIndex = products.findIndex(p => p.id === parseInt(id));
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    products[productIndex] = {
      ...products[productIndex],
      ...updateData
    };
    
    this.saveProducts(products);
    return products[productIndex];
  }

  deleteProduct(id) {
    const products = this.loadProducts();
    const productIndex = products.findIndex(p => p.id === parseInt(id));
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    products.splice(productIndex, 1);
    this.saveProducts(products);
    return true;
  }

  // Orders methods
  loadOrders() {
    try {
      const ordersPath = path.join(__dirname, '../data/orders.json');
      if (fs.existsSync(ordersPath)) {
        const data = fs.readFileSync(ordersPath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading orders:', error);
      return [];
    }
  }

  saveOrders(orders) {
    try {
      const ordersPath = path.join(__dirname, '../data/orders.json');
      fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving orders:', error);
      return false;
    }
  }

  addOrder(orderData) {
    const orders = this.loadOrders();
    const newOrder = {
      id: `ORD-${Date.now()}`,
      orderNumber: Math.floor(Math.random() * 9000) + 1000,
      ...orderData,
      createdAt: new Date().toISOString(),
      status: 'Preparando'
    };
    orders.push(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  // Sales methods
  loadSales() {
    try {
      if (fs.existsSync(this.salesPath)) {
        const data = fs.readFileSync(this.salesPath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading sales:', error);
      return [];
    }
  }

  saveSales(sales) {
    try {
      fs.writeFileSync(this.salesPath, JSON.stringify(sales, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving sales:', error);
      return false;
    }
  }

  addSale(saleData) {
    const sales = this.loadSales();
    const newSale = {
      ...saleData,
      date: new Date().toISOString().split('T')[0]
    };
    sales.push(newSale);
    this.saveSales(sales);
    return newSale;
  }
}

module.exports = new DataManager();