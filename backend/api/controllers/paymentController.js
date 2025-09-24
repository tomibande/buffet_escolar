const { MercadoPagoConfig, Preference } = require('mercadopago');
const { v4: uuidv4 } = require('uuid');
const dataManager = require('../../utils/dataManager');

// Initialize Mercado Pago client
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-2429502995306401-092321-44fdc612e60f3dc4014a3c8707d2b0f7-191149729',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const preference = new Preference(client);

class PaymentController {
  static async createPreference(req, res) {
    try {
      const { items, payer } = req.body;
      
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
        external_reference: uuidv4(),
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await preference.create({ body: preferenceData });
      
      // Store order data temporarily for webhook processing
      const orderData = {
        preferenceId: response.id,
        items,
        payer,
        total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
      
      // Store in a temporary orders cache (you might want to use Redis in production)
      global.pendingOrders = global.pendingOrders || {};
      global.pendingOrders[response.id] = orderData;
      
      res.json({
        success: true,
        data: {
          preferenceId: response.id,
          initPoint: response.init_point
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
      
      if (type === 'payment') {
        console.log('Payment notification received:', {
          type,
          paymentId: data.id,
          timestamp: new Date().toISOString()
        });
        
        // Find the order data
        const pendingOrders = global.pendingOrders || {};
        let orderData = null;
        
        // Find order by preference ID (you might need to query MP API for this)
        for (const [preferenceId, order] of Object.entries(pendingOrders)) {
          orderData = order;
          break; // For demo, take the first pending order
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
          
          console.log('Order created:', newOrder);
          
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

  static async getPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      
      res.json({
        success: true,
        data: {
          status: 'approved',
          statusDetail: 'accredited'
        }
      });
    } catch (error) {
      console.error('Error getting payment status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener el estado del pago' 
      });
    }
  }

  static async createTestOrder(req, res) {
    try {
      const { items, payer } = req.body;
      
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
}

module.exports = PaymentController;