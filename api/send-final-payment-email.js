// IMPORTANTE: Este archivo debe usar CommonJS, NO ES Modules
const { Resend } = require('resend');
const admin = require('firebase-admin');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'tu-cancion-final'
      });
    }
  } catch (err) {
    console.error('Firebase Admin init error:', err);
  }
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@tucancion.app';

module.exports = async (req, res) => {
  // CORS HEADERS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📩 sendFinalPaymentEmail API invoked');
    const { orderId, finalPaymentUrl: customUrl } = req.body || {};

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: orderId',
      });
    }

    const db = admin.firestore();
    const docSnap = await db.collection('orders').doc(orderId).get();

    if (!docSnap.exists) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado en Firestore',
      });
    }

    const orderData = { id: docSnap.id, ...docSnap.data() };
    const {
      customerEmail,
      customerName = 'Cliente',
      price = 0,
      depositAmount = 0,
    } = orderData;

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'El pedido no tiene un correo de cliente (customerEmail) asociado',
      });
    }

    const remainingAmount = Math.max(0, (Number(price) || 0) - (Number(depositAmount) || 0));
    const finalPaymentUrl = orderData.finalPaymentUrl || customUrl || `https://tucancion.app/final/${orderId}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY no configurada');
      return res.status(500).json({
        success: false,
        error: 'Resend API key is not configured',
      });
    }
    const resend = new Resend(apiKey);

    const formattedRemaining = remainingAmount.toLocaleString('es-CL');
    const formattedTotal = Number(price).toLocaleString('es-CL');
    const formattedDeposit = Number(depositAmount).toLocaleString('es-CL');

    const htmlFinalPayment = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pago Final de tu Canción - Tu Canción</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
              <div style="background: linear-gradient(135deg, #00695C 0%, #004D40 100%); color: white; padding: 35px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                  <div style="font-size: 40px; margin-bottom: 10px;">🎵</div>
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">Tu Canción</h1>
                  <p style="margin: 8px 0 0 0; font-size: 17px; opacity: 0.95;">¡Tu canción está lista para su entrega final!</p>
              </div>
              <div style="background-color: white; padding: 0;">
                  <div style="padding: 30px 25px; text-align: center; border-bottom: 1px solid #e9ecef;">
                      <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 24px; font-weight: bold;">¡Hola ${customerName}! 🎉</h2>
                      <p style="margin: 0; line-height: 1.6; color: #475569; font-size: 16px;">
                          Nos alegra informarte que el trabajo de producción de tu canción personalizada ha avanzado con éxito y nos encontramos en la etapa de entrega definitiva.
                      </p>
                  </div>
                  <div style="padding: 25px; border-bottom: 1px solid #e9ecef;">
                      <div style="display: flex; align-items: center; margin-bottom: 15px;">
                          <div style="font-size: 22px; margin-right: 10px;">💳</div>
                          <h3 style="margin: 0; color: #1e293b; font-size: 19px;">Detalle del Saldo Pendiente</h3>
                      </div>
                      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                          <div style="margin-bottom: 10px; display: flex; justify-content: space-between; font-size: 14px; color: #64748b;">
                              <span>Pedido N°:</span>
                              <strong style="font-family: monospace; color: #334155;">#${orderId.slice(0, 8)}</strong>
                          </div>
                          <div style="margin-bottom: 10px; display: flex; justify-content: space-between; font-size: 14px; color: #64748b;">
                              <span>Inversión Total del Paquete:</span>
                              <span style="font-weight: 600; color: #334155;">$${formattedTotal} CLP</span>
                          </div>
                          <div style="margin-bottom: 15px; display: flex; justify-content: space-between; font-size: 14px; color: #64748b;">
                              <span>Anticipo Inicial Pagado:</span>
                              <span style="font-weight: 600; color: #16a34a;">-$${formattedDeposit} CLP</span>
                          </div>
                          <div style="border-top: 2px dashed #cbd5e1; padding-top: 15px; display: flex; justify-content: space-between; align-items: baseline;">
                              <span style="font-size: 16px; font-weight: bold; color: #0f172a;">Saldo Final a Pagar:</span>
                              <span style="font-size: 26px; font-weight: bold; color: #00695C;">$${formattedRemaining} CLP</span>
                          </div>
                      </div>
                      <div style="text-align: center; margin: 30px 0 20px 0;">
                          <a href="${finalPaymentUrl}" target="_blank" style="background: linear-gradient(135deg, #00695C 0%, #004D40 100%); color: #ffffff; padding: 18px 40px; border-radius: 50px; font-weight: bold; font-size: 16px; text-decoration: none; display: inline-block; box-shadow: 0 4px 15px rgba(0, 105, 92, 0.35); text-transform: uppercase; letter-spacing: 0.5px;">
                              Ir a Pagar Saldo Pendiente
                          </a>
                      </div>
                      <p style="text-align: center; margin: 15px 0 0 0; font-size: 13px; color: #64748b;">
                          O copia y pega este enlace en tu navegador:<br/>
                          <a href="${finalPaymentUrl}" style="color: #00695C; word-break: break-all; font-family: monospace; font-size: 12px;">${finalPaymentUrl}</a>
                      </p>
                  </div>
                  <div style="padding: 25px; border-bottom: 1px solid #e9ecef; background-color: #fafaf9;">
                      <h4 style="margin: 0 0 10px 0; color: #1e293b; font-size: 16px;">¿Cómo realizar tu pago final?</h4>
                      <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.7;">
                          <li>Ingresa al enlace de pago seguro indicado arriba.</li>
                          <li>Verifica los datos de transferencia bancaria (puedes usar el botón <strong>"Ir a mi Banco"</strong> para acceder directo a tu entidad).</li>
                          <li>Adjunta tu comprobante de transferencia y confirma el envío.</li>
                          <li>Una vez verificado, recibirás los audios finales de tu canción en alta calidad.</li>
                      </ol>
                  </div>
                  <div style="padding: 20px 25px; text-align: center;">
                      <p style="margin: 0; font-size: 14px; color: #64748b;">
                          ¿Tienes dudas sobre tu pedido? Escríbenos directamente a 
                          <a href="mailto:contacto@tucancion.app" style="color: #00695C; font-weight: 600; text-decoration: none;">contacto@tucancion.app</a>.
                      </p>
                  </div>
              </div>
              <div style="background-color: #1e293b; color: #94a3b8; padding: 25px 20px; text-align: center; border-radius: 0 0 12px 12px;">
                  <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: bold; color: white;">Tu Canción</p>
                  <p style="margin: 0 0 12px 0; font-size: 13px; opacity: 0.85;">No dejes que se borre lo que sientes. Haz que viva siempre en una canción.</p>
                  <p style="margin: 0; font-size: 11px; opacity: 0.6;">
                      Este correo fue generado automáticamente por Tu Canción | Fecha: ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: customerEmail,
      reply_to: 'contacto@tucancion.app',
      subject: `🎵 Tu Canción está lista para entrega final - Saldo pendiente (#${orderId.slice(0, 8)})`,
      html: htmlFinalPayment,
    });

    if (error) {
      console.error('❌ Error enviando email de pago final:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Error al enviar correo con Resend',
      });
    }

    const sentAt = Date.now();
    const currentCount = Number(orderData.finalPaymentLinkSentCount) || 0;
    const newCount = currentCount + 1;

    await db.collection('orders').doc(orderId).update({
      finalPaymentUrl: finalPaymentUrl,
      finalPaymentLinkSentAt: sentAt,
      finalPaymentLinkSentTo: customerEmail,
      finalPaymentLinkSentCount: newCount,
    });

    return res.status(200).json({
      success: true,
      message: 'Enlace de pago final enviado exitosamente al cliente',
      data: {
        orderId,
        sentTo: customerEmail,
        sentAt,
        sentCount: newCount,
        finalPaymentUrl,
        resendId: data?.id,
      },
    });
  } catch (err) {
    console.error('🔥 sendFinalPaymentEmail API error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error interno del servidor',
    });
  }
};
