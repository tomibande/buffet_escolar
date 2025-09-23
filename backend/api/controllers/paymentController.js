const { MercadoPagoConfig, Preference } = require('mercadopago');
const { v4: uuidv4 } = require('uuid');

// Initialize Mercado Pago client
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-YOUR-ACCESS-TOKEN',
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
        // Here you would process the payment
        // For now, we'll just log it
        console.log('Payment notification received:', {
          type,
          paymentId: data.id,
          timestamp: new Date().toISOString()
        });
        
        // Generate order details for successful payments
        const orderNumber = Math.floor(Math.random() * 9000) + 1000;
        const estimatedTime = Math.floor(Math.random() * 20) + 10; // 10-30 minutes
        
        console.log('Order created:', {
          orderNumber,
          estimatedTime,
          paymentId: data.id
        });
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
      
      // In a real implementation, you would fetch the payment status from Mercado Pago
      // For now, we'll return a mock response
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
}

module.exports = PaymentController;