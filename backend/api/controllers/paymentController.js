const { MercadoPagoConfig, Preference } = require('mercadopago');
const { v4: uuidv4 } = require('uuid');
const dataManager = require('../../utils/dataManager');

class PaymentController {
  // Create a pending order that will be confirmed by buffet staff
  static async createPendingOrder(req, res) {
    try {
      const { items, payer } = req.body;
      
      console.log('Creating pending order for:', { items, payer });
      
      // Create pending order
      const newOrder = dataManager.addOrder({
        items,
        customerName: `${payer.firstName} ${payer.lastName}`,
        total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentId: null,
        estimatedTime: Math.floor(Math.random() * 20) + 10,
        paymentStatus: 'pending'
      });
      
      console.log('Pending order created:', newOrder);
      
      res.json({
        success: true,
        data: {
          orderNumber: newOrder.orderNumber,
          orderId: newOrder.id
        }
      });
    } catch (error) {
      console.error('Error creating pending order:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al crear el pedido pendiente',
        error: error.message
      });
    }
  }

  // Confirm payment by buffet staff
  static async confirmPayment(req, res) {
    try {
      const { orderId } = req.params;
      
      console.log('Confirming payment for order:', orderId);
      
      const orders = dataManager.loadOrders();
      const orderIndex = orders.findIndex(order => order.id === orderId);
      
      if (orderIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }
      
      const order = orders[orderIndex];
      
      // Update order status
      orders[orderIndex] = {
        ...order,
        paymentStatus: 'confirmed',
        status: 'Preparando',
        paymentId: `CONF-${Date.now()}`
      };
      
      dataManager.saveOrders(orders);
      
      // Register the sale
      order.items.forEach(item => {
        dataManager.addSale({
          productId: item.id,
          quantity: item.quantity,
          revenue: item.price * item.quantity
        });
      });
      
      console.log('Payment confirmed for order:', orderId);
      
      res.json({
        success: true,
        message: 'Pago confirmado exitosamente',
        data: orders[orderIndex]
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al confirmar el pago' 
      });
    }
  }
}

module.exports = PaymentController;