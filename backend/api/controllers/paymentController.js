const { MercadoPagoConfig, Preference } = require('mercadopago');
const { v4: uuidv4 } = require('uuid');
const dataManager = require('../../utils/dataManager');

// Initialize Mercado Pago client with test credentials
const client = new MercadoPagoConfig({
  accessToken: 'TEST-2429502995306401-092321-44fdc612e60f3dc4014a3c8707d2b0f7-191149729',
  options: {
    timeout: 5000
  }
});

class PaymentController {
  static async createPreference(req, res) {
    try {
      const { items, payer } = req.body;
      
      console.log('Creating preference for:', { items, payer });
      
      // Create preference
      const preference = new Preference(client);
      
      const preferenceData = {
        items: items.map(item => ({
          id: item.id.toString(),
          title: item.name,
          currency_id: 'ARS',
          picture_url: item.image,
          description: item.description,
          category_id: 'food',
          quantity: item.quantity,
          unit_price: parseFloat(item.price)
        })),
        payer: {
          name: payer.firstName,
          surname: payer.lastName,
          email: payer.email || 'test@test.com'
        },
        back_urls: {
          success: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/success`,
          failure: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/failure`,
          pending: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/pending`
        },
        auto_return: 'approved',
        notification_url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/payments/webhook`,
        statement_descriptor: 'CAFETERIA ESCOLAR',
        external_reference: uuidv4()
      };

      const response = await preference.create({ body: preferenceData });
      
      console.log('Preference created:', response.id);
      
      // Store order data for webhook processing
      const orderData = {
        preferenceId: response.id,
        items,
        payer,
        total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString()
      };
      
      // Store in memory for webhook processing
      global.pendingOrders = global.pendingOrders || {};
      global.pendingOrders[response.id] = orderData;
      
      res.json({
        success: true,
        data: {
          preferenceId: response.id,
          initPoint: response.init_point,
          sandboxInitPoint: response.sandbox_init_point
        }
      });
    } catch (error) {
      console.error('Error creating preference:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al crear la preferencia de pago',
        error: error.message
      });
    }
  }

  static async webhook(req, res) {
    try {
      const { type, data } = req.body;
      
      console.log('Webhook received:', { type, data });
      
      if (type === 'payment') {
        // Find the order data
        const pendingOrders = global.pendingOrders || {};
        let orderData = null;
        
        // For demo purposes, take the first pending order
        for (const [preferenceId, order] of Object.entries(pendingOrders)) {
          orderData = order;
          break;
        }
        
        if (orderData) {
          // Record the sale
          orderData.items.forEach(item => {
            dataManager.addSale({
              productId: item.id,
              quantity: item.quantity,
              revenue: item.price * item.quantity
            });
          });
          
          // Create order record
          const newOrder = dataManager.addOrder({
            items: orderData.items,
            customerName: `${orderData.payer.firstName} ${orderData.payer.lastName}`,
            total: orderData.total,
            paymentId: data.id,
            estimatedTime: Math.floor(Math.random() * 20) + 10
          });
          
          console.log('Order created from webhook:', newOrder);
          
          // Clean up pending orders
          delete global.pendingOrders[orderData.preferenceId];
        }
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Error');
    }
  }

  static async createTestOrder(req, res) {
    try {
      const { items, payer } = req.body;
      
      console.log('Creating test order:', { items, payer });
      
      // Record the sale
      items.forEach(item => {
        dataManager.addSale({
          productId: item.id,
          quantity: item.quantity,
          revenue: item.price * item.quantity
        });
      });
      
      // Create order record
      const newOrder = dataManager.addOrder({
        items,
        customerName: `${payer.firstName} ${payer.lastName}`,
        total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentId: `TEST-${Date.now()}`,
        estimatedTime: Math.floor(Math.random() * 20) + 10
      });
      
      console.log('Test order created:', newOrder);
      
      res.json({
        success: true,
        data: {
          orderNumber: newOrder.orderNumber,
          estimatedTime: newOrder.estimatedTime,
          orderId: newOrder.id
        }
      });
    } catch (error) {
      console.error('Error creating test order:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al crear el pedido de prueba' 
      });
    }
  }

  static async simulatePayment(req, res) {
    try {
      const { preferenceId } = req.body;
      
      console.log('Simulating payment for preference:', preferenceId);
      
      // Find the order data
      const pendingOrders = global.pendingOrders || {};
      const orderData = pendingOrders[preferenceId];
      
      if (!orderData) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      // Record the sale
      orderData.items.forEach(item => {
        dataManager.addSale({
          productId: item.id,
          quantity: item.quantity,
          revenue: item.price * item.quantity
        });
      });
      
      // Create order record
      const newOrder = dataManager.addOrder({
        items: orderData.items,
        customerName: `${orderData.payer.firstName} ${orderData.payer.lastName}`,
        total: orderData.total,
        paymentId: `SIM-${Date.now()}`,
        estimatedTime: Math.floor(Math.random() * 20) + 10
      });
      
      console.log('Simulated payment order created:', newOrder);
      
      // Clean up pending orders
      delete global.pendingOrders[preferenceId];
      
      res.json({
        success: true,
        data: {
          orderNumber: newOrder.orderNumber,
          estimatedTime: newOrder.estimatedTime,
          orderId: newOrder.id
        }
      });
    } catch (error) {
      console.error('Error simulating payment:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al simular el pago' 
      });
    }
  }
}

module.exports = PaymentController;