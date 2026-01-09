/**
 * BACKEND REAL - TU CANCIÓN
 * Requiere Plan Blaze en Firebase
 * * Despliegue: firebase deploy --only functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Descomentar al instalar stripe

admin.initializeApp();

// 1. Crear Intención de Pago (Stripe/MercadoPago)
// Se llama desde el frontend cuando el usuario da click en "Pagar"
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión');
  }

  const { orderId, amount } = data;
  
  // Aquí iría la lógica real de Stripe
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: amount,
  //   currency: 'clp',
  //   metadata: { orderId: orderId, userId: context.auth.uid }
  // });

  return {
    clientSecret: "pi_mock_secret_12345", // Reemplazar con real
    message: "Backend listo para procesar pagos reales con Blaze"
  };
});

// 2. Webhook para confirmar pagos automáticamente
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  // Validar firma y actualizar estado en Firestore a 'deposit_paid' o 'completed'
  res.json({received: true});
});

// 3. Notificación de Correo (Trigger cuando se crea/actualiza un pedido)
exports.onOrderUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
      const newValue = change.after.data();
      const previousValue = change.before.data();

      if (newValue.status === 'completed' && previousValue.status !== 'completed') {
          // Enviar correo de "Canción Lista" usando Resend
          console.log(`Enviar correo de entrega a ${newValue.userId}`);
      }
  });
