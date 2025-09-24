const { MercadoPagoConfig, Preference } = require('mercadopago');
const { v4: uuidv4 } = require('uuid');
const dataManager = require('../../utils/dataManager');

// # Configuración de Mercado Pago con credenciales de prueba
// # Esta parte inicializa el cliente de Mercado Pago con el token de acceso
const client = new MercadoPagoConfig({
  accessToken: 'TEST-2429502995306401-092321-44fdc612e60f3dc4014a3c8707d2b0f7-191149729',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc123' // # Clave para evitar pagos duplicados
  }
});

class PaymentController {
  // # Método principal para crear una preferencia de pago en Mercado Pago
  // # Este método recibe los productos del carrito y datos del cliente
  static async createPreference(req, res) {
    try {
      const { items, payer } = req.body;
      
      console.log('Creating preference for:', { items, payer });
      
      // # Crear una nueva instancia de preferencia de Mercado Pago
      const preference = new Preference(client);
      
      // # Configurar los datos de la preferencia de pago
      // # Aquí se definen los productos, precios, URLs de retorno, etc.
      const preferenceData = {
        // # Mapear los productos del carrito al formato de Mercado Pago
        items: items.map(item => ({
          id: item.id.toString(),
          title: item.name,
          currency_id: 'ARS', // # Moneda argentina
          picture_url: item.image,
          description: item.description,
          category_id: 'food',
          quantity: item.quantity,
          unit_price: parseFloat(item.price)
        })),
        // # Información del comprador
        payer: {
          name: payer.firstName,
          surname: payer.lastName,
          email: payer.email || 'test@test.com'
        },
        // # URLs donde Mercado Pago redirigirá después del pago
        back_urls: {
          success: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/success`,
          failure: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/failure`,
          pending: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/pending`
        },
        auto_return: 'approved', // # Retorno automático cuando el pago es aprobado
        notification_url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/payments/webhook`,
        statement_descriptor: 'CAFETERIA ESCOLAR', // # Descripción en el resumen de tarjeta
        external_reference: uuidv4(), // # Referencia única para identificar el pedido
        // # Configuración adicional para mejorar la experiencia
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12 // # Permitir hasta 12 cuotas
        },
        shipments: {
          mode: 'not_specified' // # No hay envío físico
        }
      };

      // # Crear la preferencia en Mercado Pago
      const response = await preference.create({ body: preferenceData });
      
      console.log('Preference created:', response.id);
      
      // # Guardar los datos del pedido para procesamiento posterior
      const orderData = {
        preferenceId: response.id,
        items,
        payer,
        total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString()
      };
      
      // # Almacenar en memoria para el webhook
      global.pendingOrders = global.pendingOrders || {};
      global.pendingOrders[response.id] = orderData;
      
      // # Enviar respuesta con los enlaces de pago
      res.json({
        success: true,
        data: {
          preferenceId: response.id,
          initPoint: response.init_point, // # URL para producción
          sandboxInitPoint: response.sandbox_init_point // # URL para pruebas
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

  // # Webhook para recibir notificaciones de Mercado Pago
  // # Este método se ejecuta cuando Mercado Pago notifica cambios en el pago
  static async webhook(req, res) {
    try {
      const { type, data } = req.body;
      
      console.log('Webhook received:', { type, data });
      
      // # Procesar solo notificaciones de pago
      if (type === 'payment') {
        // # Buscar los datos del pedido pendiente
        const pendingOrders = global.pendingOrders || {};
        let orderData = null;
        
        // # Para demo, tomar el primer pedido pendiente
        for (const [preferenceId, order] of Object.entries(pendingOrders)) {
          orderData = order;
          break;
        }
        
        if (orderData) {
          // # Registrar la venta en el sistema
          orderData.items.forEach(item => {
            dataManager.addSale({
              productId: item.id,
              quantity: item.quantity,
              revenue: item.price * item.quantity
            });
          });
          
          // # Crear registro del pedido
          const newOrder = dataManager.addOrder({
            items: orderData.items,
            customerName: `${orderData.payer.firstName} ${orderData.payer.lastName}`,
            total: orderData.total,
            paymentId: data.id,
            estimatedTime: Math.floor(Math.random() * 20) + 10
          });
          
          console.log('Order created from webhook:', newOrder);
          
          // # Limpiar pedidos pendientes
          delete global.pendingOrders[orderData.preferenceId];
        }
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Error');
    }
  }

  // # Método para crear pedidos de prueba (desarrollo)
  static async createTestOrder(req, res) {
    try {
      const { items, payer } = req.body;
      
      console.log('Creating test order:', { items, payer });
      
      // # Registrar la venta
      items.forEach(item => {
        dataManager.addSale({
          productId: item.id,
          quantity: item.quantity,
          revenue: item.price * item.quantity
        });
      });
      
      // # Crear registro del pedido
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

  // # Método para simular pagos (desarrollo)
  static async simulatePayment(req, res) {
    try {
      const { preferenceId } = req.body;
      
      console.log('Simulating payment for preference:', preferenceId);
      
      // # Buscar los datos del pedido
      const pendingOrders = global.pendingOrders || {};
      const orderData = pendingOrders[preferenceId];
      
      if (!orderData) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      // # Registrar la venta
      orderData.items.forEach(item => {
        dataManager.addSale({
          productId: item.id,
          quantity: item.quantity,
          revenue: item.price * item.quantity
        });
      });
      
      // # Crear registro del pedido
      const newOrder = dataManager.addOrder({
        items: orderData.items,
        customerName: `${orderData.payer.firstName} ${orderData.payer.lastName}`,
        total: orderData.total,
        paymentId: `SIM-${Date.now()}`,
        estimatedTime: Math.floor(Math.random() * 20) + 10
      });
      
      console.log('Simulated payment order created:', newOrder);
      
      // # Limpiar pedidos pendientes
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