const dataManager = require('../../utils/dataManager');

class ProductController {
  static async getAllProducts(req, res) {
    try {
      const products = dataManager.loadProducts();
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createProduct(req, res) {
    try {
      const newProduct = dataManager.addProduct(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: newProduct
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updatedProduct = dataManager.updateProduct(id, req.body);
      
      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: updatedProduct
      });
    } catch (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ 
          success: false, 
          message: 'Producto no encontrado' 
        });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      dataManager.deleteProduct(id);
      
      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ 
          success: false, 
          message: 'Producto no encontrado' 
        });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getSalesStats(req, res) {
    try {
      const products = dataManager.loadProducts();
      const sales = dataManager.loadSales();
      
      // Calculate total cumulative revenue from all days
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.revenue, 0);
      
      // Get all product sales data for weekly view
      const productSales = sales.reduce((acc, sale) => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
          acc.push({
            productName: product.name,
            quantity: sale.quantity,
            revenue: sale.revenue,
            date: sale.date
          });
        }
        return acc;
      }, []);

      // Calculate top products from all sales data
      const productTotals = sales.reduce((acc, sale) => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
          if (!acc[sale.productId]) {
            acc[sale.productId] = {
              productName: product.name,
              totalQuantity: 0,
              totalRevenue: 0
            };
          }
          acc[sale.productId].totalQuantity += sale.quantity;
          acc[sale.productId].totalRevenue += sale.revenue;
        }
        return acc;
      }, {});
      
      const topProducts = Object.values(productTotals)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 5);

      res.json({
        success: true,
        data: {
          totalRevenue,
          productSales,
          topProducts
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async recordSale(req, res) {
    try {
      const { items } = req.body;
      
      // Record each item as a sale
      items.forEach(item => {
        dataManager.addSale({
          productId: item.id,
          quantity: item.quantity,
          revenue: item.price * item.quantity
        });
      });
      
      res.json({
        success: true,
        message: 'Venta registrada exitosamente'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getOrders(req, res) {
    try {
      const orders = dataManager.loadOrders();
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ProductController;