class ProductController {
  static products = [
    {
      id: 1,
      name: 'Sándwich de Pollo',
      description: 'Pechuga de pollo a la parrilla con lechuga, tomate y mayonesa',
      price: 850,
      category: 'principal',
      image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Ensalada Fresca',
      description: 'Mezcla de hojas verdes con tomates cherry, pepinos y aderezo',
      price: 550,
      category: 'principal',
      image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      rating: 4.2
    },
    {
      id: 3,
      name: 'Porción de Pizza',
      description: 'Pizza clásica de queso con salsa marinara',
      price: 700,
      category: 'principal',
      image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      rating: 4.7
    },
    {
      id: 4,
      name: 'Papas Fritas',
      description: 'Papas doradas y crujientes con sal marina',
      price: 350,
      category: 'acompañamiento',
      image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      rating: 4.3
    },
    {
      id: 5,
      name: 'Jugo de Naranja',
      description: 'Jugo de naranja recién exprimido',
      price: 300,
      category: 'bebida',
      image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      rating: 4.1
    },
    {
      id: 6,
      name: 'Galleta de Chocolate',
      description: 'Galleta tibia recién horneada con chips de chocolate',
      price: 250,
      category: 'postre',
      image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=400',
      available: true,
      rating: 4.8
    }
  ];

  static sales = [
    { productId: 1, date: '2024-01-15', quantity: 25, revenue: 21250 },
    { productId: 2, date: '2024-01-15', quantity: 15, revenue: 8250 },
    { productId: 3, date: '2024-01-15', quantity: 30, revenue: 21000 },
    { productId: 4, date: '2024-01-15', quantity: 40, revenue: 14000 },
    { productId: 5, date: '2024-01-15', quantity: 35, revenue: 10500 },
    { productId: 6, date: '2024-01-15', quantity: 20, revenue: 5000 }
  ];

  static async getAllProducts(req, res) {
    try {
      res.json({ success: true, data: this.products });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createProduct(req, res) {
    try {
      const newProduct = {
        id: this.products.length + 1,
        ...req.body,
        available: true,
        rating: 0
      };
      
      this.products.push(newProduct);
      
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
      const productIndex = this.products.findIndex(p => p.id === parseInt(id));
      
      if (productIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          message: 'Producto no encontrado' 
        });
      }
      
      this.products[productIndex] = {
        ...this.products[productIndex],
        ...req.body
      };
      
      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: this.products[productIndex]
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const productIndex = this.products.findIndex(p => p.id === parseInt(id));
      
      if (productIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          message: 'Producto no encontrado' 
        });
      }
      
      this.products.splice(productIndex, 1);
      
      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getSalesStats(req, res) {
    try {
      const totalRevenue = this.sales.reduce((sum, sale) => sum + sale.revenue, 0);
      
      const productSales = this.sales.reduce((acc, sale) => {
        const product = this.products.find(p => p.id === sale.productId);
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

      const topProducts = productSales
        .sort((a, b) => b.quantity - a.quantity)
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
}

module.exports = ProductController;