const mercadopago = require('mercadopago');
const { v4: uuidv4 } = require('uuid');

// Configure Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-YOUR-ACCESS-TOKEN'
});

class PaymentController {
  static async createPreference(req, res) {
    try {
      const { items, payer } = req.body;
      
      const preference = {
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

      const response = await mercadopago.preferences.create(preference);
      
      res.json({
        success: true,
        data: {
          preferenceId: response.body.id,
          initPoint: response.body.init_point
        }
      });
    } catch (error) {
      console.error('Error creating preference:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al crear la preferencia de pago' 
      });
    }
  }

  static async webhook(req, res) {
    try {
      const { type, data } = req.body;
      
      if (type === 'payment') {
        const payment = await mercadopago.payment.findById(data.id);
        
        // Process payment status
        if (payment.body.status === 'approved') {
          // Generate order number and estimated time
          const orderNumber = Math.floor(Math.random() * 9000) + 1000;
          const estimatedTime = Math.floor(Math.random() * 20) + 10; // 10-30 minutes
          
          // Here you would save the order to database
          console.log('Payment approved:', {
            orderId: payment.body.external_reference,
            orderNumber,
            estimatedTime,
            amount: payment.body.transaction_amount
          });
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
      const payment = await mercadopago.payment.findById(paymentId);
      
      res.json({
        success: true,
        data: {
          status: payment.body.status,
          statusDetail: payment.body.status_detail
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error al obtener el estado del pago' 
      });
    }
  }
}

module.exports = PaymentController;