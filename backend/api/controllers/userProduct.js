class UserProductController {
  static async getUserProducts(req, res) {
    try {
      const { userId } = req.params;
      // Logic to get user's ordered products
      const products = [
        { id: 1, name: 'Pizza Slice', price: 3.50, quantity: 2 },
        { id: 2, name: 'Chicken Sandwich', price: 4.25, quantity: 1 },
        { id: 3, name: 'Fresh Salad', price: 2.75, quantity: 1 }
      ];
      
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async addProductToUser(req, res) {
    try {
      const { userId } = req.params;
      const { productId, quantity } = req.body;
      
      // Logic to add product to user's order
      res.json({ 
        success: true, 
        message: 'Product added to order successfully',
        data: { userId, productId, quantity }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async removeProductFromUser(req, res) {
    try {
      const { userId, productId } = req.params;
      
      // Logic to remove product from user's order
      res.json({ 
        success: true, 
        message: 'Product removed from order successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = UserProductController;