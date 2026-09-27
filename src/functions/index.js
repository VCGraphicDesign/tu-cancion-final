/**
 * BACKEND REAL - TU CANCIÓN
 * Requiere Plan Blaze en Firebase
 * * Despliegue: firebase deploy --only functions
 */

const functions = require("firebase-functions/v1");
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

// 4. Envío de correo al completar un pedido
// Portado desde api/send-email.js — recibe { orderId }, lee el pedido de Firestore,
// y envía dos correos: uno al administrador y otro al cliente.
const { defineSecret } = require('firebase-functions/params');
const resendApiKey = defineSecret('RESEND_API_KEY');

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@tucancion.app';
const EMAIL_TO = process.env.EMAIL_TO || 'contacto@tucancion.app';

exports.sendEmail = functions.https
  .onRequest({ secrets: [resendApiKey] }, async (req, res) => {
    // ======================
    // CORS HEADERS
    // ======================
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only POST allowed
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      console.log('📩 SendEmail function invoked');

      // ======================
      // VALIDACIÓN BÁSICA
      // ======================
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: orderId',
        });
      }

      // ======================
      // OBTENER PEDIDO REAL DESDE FIRESTORE
      // Usa admin ya inicializado en la línea 11 de este archivo.
      // ======================
      const db = admin.firestore();
      const docSnap = await db.collection('orders').doc(orderId).get();

      if (!docSnap.exists) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }

      const pedidoReal = { id: docSnap.id, ...docSnap.data() };

      const {
        customerEmail,
        customerName,
        createdAt,
        status,
        receiptUrl,
        receiptFileName
      } = pedidoReal;

      // Extraer package y songsData del nivel principal del pedido
      const packageType = pedidoReal.package || pedidoReal.request?.package;
      const songsDataArray = pedidoReal.songsData || [];

      // Crear variables para el template según el paquete
      const songs = [];

      // Usar los datos reales de cada canción
      songsDataArray.forEach((songData, index) => {
        songs.push({
          songNumber: index + 1,
          genre: songData.genre || 'N/A',
          mood: songData.mood || 'N/A',
          occasion: songData.occasion || 'N/A',
          singer: songData.singer || 'N/A',
          instruments: songData.instruments || [],
          story: songData.story || 'No proporcionada'
        });
      });

      const packageInfo = {
        name: packageType === 'single' ? '1 Canción' : packageType === 'duo' ? '2 Canciones' : '3 Canciones',
        totalPrice: packageType === 'single' ? 30000 : packageType === 'duo' ? 45000 : 60000,
        depositAmount: packageType === 'single' ? 15000 : packageType === 'duo' ? 22500 : 30000,
        remainingAmount: packageType === 'single' ? 15000 : packageType === 'duo' ? 22500 : 30000
      };

      // Validar estructura mínima del pedido
      if (
        !packageType ||
        !customerEmail ||
        !customerName ||
        !createdAt
      ) {
        return res.status(500).json({
          success: false,
          error: 'Invalid order structure',
        });
      }

      console.log('✅ Pedido validado desde Firebase:', orderId);

      // ======================
      // OBTENER COMPROBANTE (si existe) PARA ADJUNTAR AL CORREO ADMIN
      // ======================
      let emailAttachments = [];
      if (receiptUrl && receiptFileName) {
        try {
          console.log('📎 Descargando comprobante:', receiptFileName);
          const receiptResponse = await fetch(receiptUrl);
          if (receiptResponse.ok) {
            const arrayBuffer = await receiptResponse.arrayBuffer();
            const base64Content = Buffer.from(arrayBuffer).toString('base64');

            // Determinar tipo MIME por extensión
            const ext = receiptFileName.toLowerCase().split('.').pop();
            const mimeMap = {
              jpg: 'image/jpeg',
              jpeg: 'image/jpeg',
              png: 'image/png',
              webp: 'image/webp',
              gif: 'image/gif',
              pdf: 'application/pdf',
            };
            const contentType = mimeMap[ext] || 'application/octet-stream';

            emailAttachments = [{
              filename: receiptFileName,
              content: base64Content,
              type: contentType,
            }];
            console.log('✅ Comprobante listo para adjuntar:', receiptFileName, `(${contentType})`);
          } else {
            console.warn('⚠ No se pudo descargar el comprobante, status:', receiptResponse.status);
          }
        } catch (attachErr) {
          console.error('⚠ Error al obtener el comprobante (el correo se enviará sin adjunto):', attachErr.message);
        }
      } else {
        console.log('ℹ Pedido sin comprobante adjunto aún.');
      }

      // ======================
      // INICIALIZAR RESEND
      // ======================
      const { Resend } = require('resend');
      const apiKey = (typeof resendApiKey?.value === 'function' ? resendApiKey.value() : '') || process.env.RESEND_API_KEY;
      if (!apiKey) {
        console.error('❌ RESEND_API_KEY no configurada');
        return res.status(500).json({
          success: false,
          error: 'Resend API key is not configured',
        });
      }
      const resend = new Resend(apiKey);

      // ======================
      // EMAIL INTERNO (ADMIN) - CON DISEÑO ORIGINAL
      // ======================
      const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: EMAIL_TO,
        subject: '🎵 Nueva Solicitud de Canción - Tu Canción',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
            <!-- CABECERA -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <div style="font-size: 36px; margin-bottom: 10px;">🎵</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Tu Canción</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">¡Nuevo Pedido Recibido!</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.7;">${new Date(createdAt).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</p>
            </div>
            
            <!-- CONTENIDO PRINCIPAL -->
            <div style="background-color: white; padding: 0;">
              
              <!-- SECCIÓN CLIENTE -->
              <div style="padding: 25px; border-bottom: 1px solid #e9ecef;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="font-size: 24px; margin-right: 12px;">👤</div>
                  <h2 style="margin: 0; color: #2c3e50; font-size: 20px;">Datos del Cliente</h2>
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
                  <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #495057;">Nombre:</strong> <span style="color: #2c3e50;">${customerName}</span></p>
                  <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #495057;">Email:</strong> <a href="mailto:${customerEmail}" style="color: #2563eb; text-decoration: none;">${customerEmail}</a></p>
                </div>
              </div>
              
              <!-- SECCIÓN PAQUETE -->
              <div style="padding: 25px; border-bottom: 1px solid #e9ecef;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="font-size: 24px; margin-right: 12px;">📦</div>
                  <h2 style="margin: 0; color: #2c3e50; font-size: 20px;">Información del Paquete</h2>
                </div>
                <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                  <p style="margin: 0; font-size: 18px; color: #1976d2; font-weight: bold;">${packageInfo?.name || 'N/A'}</p>
                  <p style="margin: 5px 0 0 0; font-size: 24px; color: #2c3e50; font-weight: bold;">$${packageInfo?.totalPrice?.toLocaleString('es-CL') || '0'}</p>
                  <p style="margin: 5px 0 0 0; font-size: 14px; color: #6c757d;">Precio Total del Paquete</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="color: #856404; font-weight: bold;">Depósito requerido:</span>
                    <span style="color: #856404; font-size: 18px; font-weight: bold;">$${packageInfo?.depositAmount?.toLocaleString('es-CL') || '0'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #856404; font-weight: bold;">Resto a pagar:</span>
                    <span style="color: #856404; font-size: 18px; font-weight: bold;">$${packageInfo?.remainingAmount?.toLocaleString('es-CL') || '0'}</span>
                  </div>
                </div>
              </div>
              
              <!-- SECCIÓN CANCIONES -->
              <div style="padding: 25px; border-bottom: 1px solid #e9ecef;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="font-size: 24px; margin-right: 12px;">🎵</div>
                  <h2 style="margin: 0; color: #2c3e50; font-size: 20px;">Canciones del Paquete</h2>
                </div>
                
                ${songs.map((song, index) => `
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #2563eb;">
                    <h4 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px; font-weight: bold;">Canción ${song.songNumber}</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                      <div>
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #6c757d; font-weight: bold;">GÉNERO</p>
                        <p style="margin: 0; font-size: 16px; color: #2c3e50;">${song.genre || 'N/A'}</p>
                      </div>
                      <div>
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #6c757d; font-weight: bold;">ÁNIMO</p>
                        <p style="margin: 0; font-size: 16px; color: #2c3e50;">${song.mood || 'N/A'}</p>
                      </div>
                      <div>
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #6c757d; font-weight: bold;">OCASIÓN</p>
                        <p style="margin: 0; font-size: 16px; color: #2c3e50;">${song.occasion || 'N/A'}</p>
                      </div>
                      <div>
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #6c757d; font-weight: bold;">VOZ</p>
                        <p style="margin: 0; font-size: 16px; color: #2c3e50;">${song.singer || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                      <p style="margin: 0 0 5px 0; font-size: 14px; color: #6c757d; font-weight: bold;">INSTRUMENTOS</p>
                      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${(song.instruments || []).map(instrument =>
                          `<span style="background-color: #007bff; color: white; padding: 6px 12px; border-radius: 15px; font-size: 12px; font-weight: bold;">${instrument}</span>`
                        ).join('')}
                      </div>
                    </div>
                    
                    <div>
                      <p style="margin: 0 0 5px 0; font-size: 14px; color: #6c757d; font-weight: bold;">HISTORIA</p>
                      <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef;">
                        <p style="margin: 0; line-height: 1.6; color: #495057; font-size: 14px;">${song.story || 'No proporcionada'}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- FOOTER -->
            <div style="background-color: #2c3e50; color: white; padding: 25px 20px; text-align: center; border-radius: 0 0 12px 12px;">
              <div style="margin-bottom: 20px;">
                <a href="#" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 0 5px;">Ver en Panel</a>
                <a href="mailto:${customerEmail}" style="background-color: #6c757d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 0 5px;">Contactar Cliente</a>
              </div>
              <p style="margin: 0; font-size: 12px; opacity: 0.7;">Este email fue generado automáticamente por Tu Canción</p>
            </div>
          </div>
        `,
        attachments: emailAttachments,
      });

      if (error) {
        console.error('❌ Error enviando email interno:', error);
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      console.log('✅ Email interno enviado');

      // ======================
      // EMAIL AL CLIENTE - CON DISEÑO ORIGINAL
      // ======================
      try {
        // Determinar mensaje según cantidad de canciones
        let mensajeCanciones;
        if (songs.length === 1) {
          mensajeCanciones = "Estamos creando tu canción";
        } else if (songs.length === 2) {
          mensajeCanciones = "Estamos creando tus 2 canciones";
        } else if (songs.length === 3) {
          mensajeCanciones = "Estamos creando tus 3 canciones";
        } else {
          mensajeCanciones = "Estamos creando tus canciones";
        }

        const htmlCliente = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Gracias por tu confianza - Tu Canción</title>
          </head>
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
                  <!-- CABECERA -->
                  <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                      <div style="font-size: 36px; margin-bottom: 10px;">🎵</div>
                      <h1 style="margin: 0; font-size: 28px; font-weight: bold;">¡Gracias por tu confianza!</h1>
                      <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Tu Canción - Creación Musical Personalizada</p>
                  </div>
                  
                  <!-- CONTENIDO PRINCIPAL -->
                  <div style="background-color: white; padding: 0;">
                      
                      <!-- MENSAJE DE BIENVENIDA -->
                      <div style="padding: 30px 25px; text-align: center; border-bottom: 1px solid #e9ecef;">
                          <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: bold;">¡Hola ${customerName}! 🎉</h2>
                          <p style="margin: 0; line-height: 1.6; color: #495057; font-size: 16px;">
                              Queremos expresarte nuestro más sincero <strong style="color: #28a745;">agradecimiento</strong> por elegirnos 
                              para crear esa canción especial que tienes en mente. ¡Es un honor ser parte de tu proyecto!
                          </p>
                      </div>
                      
                      <!-- CONFIRMACIÓN DE PAGO -->
                      <div style="padding: 25px; border-bottom: 1px solid #e9ecef;">
                          <div style="display: flex; align-items: center; margin-bottom: 15px;">
                              <div style="font-size: 24px; margin-right: 12px;">💚</div>
                              <h3 style="margin: 0; color: #2c3e50; font-size: 20px;">Confirmación de tu Reserva</h3>
                          </div>
                          <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                              <p style="margin: 0; font-size: 16px; color: #155724; font-weight: bold; margin-bottom: 10px;">
                                  ✅ ¡Hemos recibido tu pago correctamente!
                              </p>
                              <p style="margin: 0; font-size: 15px; color: #155724; line-height: 1.5;">
                                  Tu depósito de <strong>$${packageInfo?.depositAmount?.toLocaleString('es-CL')}</strong> ha sido procesado 
                                  y tu proyecto ya está oficialmente en nuestra lista de creaciones.
                              </p>
                          </div>
                      </div>
                      
                      <!-- DETALLES DEL PROYECTO -->
                      <div style="padding: 25px; border-bottom: 1px solid #e9ecef;">
                          <div style="display: flex; align-items: center; margin-bottom: 15px;">
                              <div style="font-size: 24px; margin-right: 12px;">🎼</div>
                              <h3 style="margin: 0; color: #2c3e50; font-size: 20px;">Tu Proyecto Musical</h3>
                          </div>
                          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                  <div>
                                      <p style="margin: 0 0 5px 0; font-size: 14px; color: #6c757d; font-weight: bold;">PAQUETE</p>
                                      <p style="margin: 0; font-size: 16px; color: #2c3e50; font-weight: bold;">${packageInfo?.name}</p>
                                  </div>
                                  <div>
                                      <p style="margin: 0 0 5px 0; font-size: 14px; color: #6c757d; font-weight: bold;">INVERSIÓN TOTAL</p>
                                      <p style="margin: 0; font-size: 16px; color: #2c3e50; font-weight: bold;">$${packageInfo?.totalPrice?.toLocaleString('es-CL')}</p>
                                  </div>
                              </div>
                              <div style="text-align: center; padding: 15px; background-color: #e3f2fd; border-radius: 6px;">
                                  <p style="margin: 0; font-size: 14px; color: #1976d2; font-weight: bold;">RESTO POR PAGAR</p>
                                  <p style="margin: 5px 0 0 0; font-size: 18px; color: #1976d2; font-weight: bold;">$${packageInfo?.remainingAmount?.toLocaleString('es-CL')}</p>
                              </div>
                          </div>
                      </div>
                      
                      <!-- PROCESO DE CREACIÓN -->
                      <div style="padding: 25px; border-bottom: 1px solid #e9ecef;">
                          <div style="display: flex; align-items: center; margin-bottom: 15px;">
                              <div style="font-size: 24px; margin-right: 12px;">🎨</div>
                              <h3 style="margin: 0; color: #2c3e50; font-size: 20px;">¿Qué Sigue Ahora?</h3>
                          </div>
                          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                              <div style="margin-bottom: 15px;">
                                  <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 16px; font-weight: bold;">📝 ${mensajeCanciones}</h4>
                                  <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.5;">
                                      Comenzaremos a darle vida a tus ideas, creando cada canción con todo el cuidado y profesionalismo que mereces.
                                  </p>
                              </div>
                              <div style="margin-bottom: 15px;">
                                  <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 16px; font-weight: bold;">📵 Te mantendremos informado</h4>
                                  <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.5;">
                                      Nos comunicaremos contigo a la brevedad para informarte sobre los avances de tu creación.
                                  </p>
                              </div>
                              <div>
                                  <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 16px; font-weight: bold;">🎧 Recibirás un demo</h4>
                                  <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.5;">
                                      Te enviaremos un enlace con la versión preliminar para tu aprobación. 
                                      Si estás de acuerdo, solo necesitarás realizar el pago final para recibir tus canciones completas.
                                  </p>
                              </div>
                          </div>
                      </div>
                      
                      <!-- CONTACTO Y SOPORTE -->
                      <div style="padding: 25px;">
                          <div style="display: flex; align-items: center; margin-bottom: 15px;">
                              <div style="font-size: 24px; margin-right: 12px;">💬</div>
                              <h3 style="margin: 0; color: #2c3e50; font-size: 20px;">¿Tienes Preguntas?</h3>
                          </div>
                          <p style="margin: 0 0 15px 0; font-size: 15px; color: #495057; line-height: 1.5;">
                              Estamos aquí para ti. Si necesitas cualquier aclaración o quieres agregar detalles adicionales a tu proyecto, 
                              no dudes en contactarnos.
                          </p>
                          <div style="text-align: center;">
                              <a href="mailto:contacto@tucancion.app" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 0 5px;">
                                  Enviar Mensaje
                              </a>
                              <a href="https://tucancion.app" style="background-color: #6c757d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 0 5px;">
                                  Visitar Web
                              </a>
                          </div>
                      </div>
                  </div>
                  
                  <!-- FOOTER -->
                  <div style="background-color: #2c3e50; color: white; padding: 25px 20px; text-align: center; border-radius: 0 0 12px 12px;">
                      <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">¡Gracias por elegir Tu Canción! 🎵</p>
                      <p style="margin: 0; font-size: 14px; opacity: 0.9;">Donde cada nota cuenta tu historia</p>
                      <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.7;">
                          Este email fue enviado automáticamente | Fecha: ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}
                      </p>
                  </div>
              </div>
          </body>
          </html>
        `;

        const { error: customerError } = await resend.emails.send({
          from: EMAIL_FROM,
          to: customerEmail,
          subject: '¡Gracias por tu confianza - Tu Canción',
          html: htmlCliente,
        });

        if (customerError) {
          console.error('⚠ Error enviando email al cliente:', customerError);
        } else {
          console.log('✅ Email enviado al cliente');
        }
      } catch (customerEmailError) {
        console.error('Customer email error:', customerEmailError);
      }

      // ======================
      // RESPUESTA FINAL
      // ======================
      return res.status(200).json({
        success: true,
        id: data.id,
        message: 'Emails sent successfully',
      });
    } catch (err) {
      console.error('🔥 SendEmail fatal error:', err);
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

// ==============================================================
// 5. Envío de Enlace de Pago Final al Cliente (Automatizado)
// Recibe { orderId, finalPaymentUrl? }, obtiene los datos reales
// de la orden en Firestore, envía el correo con Resend y registra
// los metadatos de auditoría en el pedido.
// ==============================================================
exports.sendFinalPaymentEmail = functions.https
  .onRequest({ secrets: [resendApiKey] }, async (req, res) => {
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
      console.log('📩 sendFinalPaymentEmail function invoked');

      const { orderId, finalPaymentUrl: customUrl } = req.body || {};

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: orderId',
        });
      }

      // Obtener pedido desde Firestore
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

      // Calcular saldo pendiente y url del pago final
      const remainingAmount = Math.max(0, (Number(price) || 0) - (Number(depositAmount) || 0));
      const finalPaymentUrl = orderData.finalPaymentUrl || customUrl || `https://tucancion.app/final/${orderId}`;

      // Inicializar Resend
      const { Resend } = require('resend');
      const apiKey = (typeof resendApiKey?.value === 'function' ? resendApiKey.value() : '') || process.env.RESEND_API_KEY;
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
                <!-- CABECERA -->
                <div style="background: linear-gradient(135deg, #00695C 0%, #004D40 100%); color: white; padding: 35px 20px; text-align: center; border-radius: 12px 12px 0 0;">
                    <div style="font-size: 40px; margin-bottom: 10px;">🎵</div>
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">Tu Canción</h1>
                    <p style="margin: 8px 0 0 0; font-size: 17px; opacity: 0.95;">¡Tu canción está lista para su entrega final!</p>
                </div>
                
                <!-- CONTENIDO PRINCIPAL -->
                <div style="background-color: white; padding: 0;">
                    
                    <!-- SALUDO -->
                    <div style="padding: 30px 25px; text-align: center; border-bottom: 1px solid #e9ecef;">
                        <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 24px; font-weight: bold;">¡Hola ${customerName}! 🎉</h2>
                        <p style="margin: 0; line-height: 1.6; color: #475569; font-size: 16px;">
                            Nos alegra informarte que el trabajo de producción de tu canción personalizada ha avanzado con éxito y nos encontramos en la etapa de entrega definitiva.
                        </p>
                    </div>
                    
                    <!-- DETALLES DEL PAGO FINAL -->
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

                        <!-- BOTÓN DE ACCIÓN -->
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

                    <!-- INSTRUCCIONES -->
                    <div style="padding: 25px; border-bottom: 1px solid #e9ecef; background-color: #fafaf9;">
                        <h4 style="margin: 0 0 10px 0; color: #1e293b; font-size: 16px;">¿Cómo realizar tu pago final?</h4>
                        <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.7;">
                            <li>Ingresa al enlace de pago seguro indicado arriba.</li>
                            <li>Verifica los datos de transferencia bancaria (puedes usar el botón <strong>"Ir a mi Banco"</strong> para acceder directo a tu entidad).</li>
                            <li>Adjunta tu comprobante de transferencia y confirma el envío.</li>
                            <li>Una vez verificado, recibirás los audios finales de tu canción en alta calidad.</li>
                        </ol>
                    </div>

                    <!-- AYUDA / CONTACTO -->
                    <div style="padding: 20px 25px; text-align: center;">
                        <p style="margin: 0; font-size: 14px; color: #64748b;">
                            ¿Tienes dudas sobre tu pedido? Escríbenos directamente a 
                            <a href="mailto:contacto@tucancion.app" style="color: #00695C; font-weight: 600; text-decoration: none;">contacto@tucancion.app</a>.
                        </p>
                    </div>
                </div>

                <!-- FOOTER -->
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

      // Enviar correo con Resend
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

      console.log('✅ Email de pago final enviado exitosamente:', data?.id);

      // Actualizar auditoría en Firestore únicamente tras envío confirmado
      const sentAt = Date.now();
      const currentCount = Number(orderData.finalPaymentLinkSentCount) || 0;
      const newCount = currentCount + 1;

      await db.collection('orders').doc(orderId).update({
        finalPaymentUrl: finalPaymentUrl,
        finalPaymentLinkSentAt: sentAt,
        finalPaymentLinkSentTo: customerEmail,
        finalPaymentLinkSentCount: newCount,
      });

      console.log(`✅ Auditoría de orden ${orderId} actualizada en Firestore (envío #${newCount})`);

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
      console.error('🔥 sendFinalPaymentEmail fatal error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Error interno del servidor',
      });
    }
  });

// ==============================================================
// 6. Consulta pública de datos de pago final (sin Auth)
// GET /api/get-order-public?orderId=XXX
// Devuelve únicamente los datos estrictamente necesarios para
// que FinalPayment pueda mostrar el saldo pendiente y validar
// el estado del pedido, sin exponer información privada.
// ==============================================================
exports.getOrderPublic = functions.https.onRequest(async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { orderId } = req.query;

  if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
    return res.status(400).json({ success: false, error: 'Missing required parameter: orderId' });
  }

  try {
    const db = admin.firestore();
    const docSnap = await db.collection('orders').doc(orderId).get();

    if (!docSnap.exists) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado.' });
    }

    const data = docSnap.data();
    const status = data.status || '';

    // Pedidos en estos estados no deben permitir el pago final
    if (status === 'completed') {
      return res.status(200).json({
        success: true,
        completed: true,
        message: 'Este pedido ya está completamente pagado.',
      });
    }

    if (status === 'pending_payment') {
      return res.status(200).json({
        success: true,
        blocked: true,
        message: 'El anticipo de este pedido aún no ha sido confirmado.',
      });
    }

    // Calcular saldo pendiente
    const price = Number(data.price) || 0;
    const depositAmount = Number(data.depositAmount) || 0;
    const remainingAmount = Math.max(0, price - depositAmount);

    // Devolver SOLO los datos necesarios para el pago final
    // NO se incluye: customerEmail, userId, songsData, receiptUrl,
    // información administrativa, ni ningún dato privado del cliente.
    return res.status(200).json({
      success: true,
      order: {
        id: docSnap.id,
        status,
        price,
        depositAmount,
        remainingAmount,
        customerName: data.customerName || 'Cliente',
      },
    });
  } catch (err) {
    console.error('🔥 getOrderPublic error:', err);
    return res.status(500).json({ success: false, error: 'Error interno al consultar el pedido.' });
  }
});

// ==============================================================
// 7. Envío del comprobante de pago final (sin Auth de cliente)
// POST /api/submit-final-receipt
// Recibe { orderId } + archivo adjunto (multipart/form-data).
// Usa Admin SDK para escribir en Firestore y Storage sin requerir
// Firebase Auth activo en el cliente.
// ==============================================================
exports.submitFinalReceipt = functions.https.onRequest(async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const Busboy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const { orderId } = req.body || {};

    // Si viene como form-data, el orderId puede estar en los campos
    let resolvedOrderId = orderId;
    let fileBuffer = null;
    let fileName = null;
    let fileMime = null;

    await new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      const tmpdir = os.tmpdir();
      const uploads = {};
      let fields = {};

      busboy.on('field', (fieldname, val) => {
        fields[fieldname] = val;
      });

      busboy.on('file', (fieldname, file, info) => {
        const { filename, mimeType } = info;
        const filepath = path.join(tmpdir, filename);
        uploads[fieldname] = { filepath, filename, mimeType };
        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);
      });

      busboy.on('finish', () => {
        resolvedOrderId = resolvedOrderId || fields.orderId;
        if (uploads.receipt) {
          fileBuffer = fs.readFileSync(uploads.receipt.filepath);
          fileName = uploads.receipt.filename;
          fileMime = uploads.receipt.mimeType;
          // Limpiar archivo temporal
          try { fs.unlinkSync(uploads.receipt.filepath); } catch (_) {}
        }
        resolve();
      });

      busboy.on('error', reject);
      req.pipe(busboy);
    });

    if (!resolvedOrderId || typeof resolvedOrderId !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing required field: orderId' });
    }

    if (!fileBuffer || !fileName) {
      return res.status(400).json({ success: false, error: 'Missing required field: receipt file' });
    }

    const db = admin.firestore();
    const docSnap = await db.collection('orders').doc(resolvedOrderId).get();

    if (!docSnap.exists) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado.' });
    }

    const orderData = docSnap.data();

    if (orderData.status === 'completed') {
      return res.status(409).json({ success: false, error: 'Este pedido ya está completamente pagado.' });
    }

    // Sanitizar nombre de archivo
    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `receipts-final/public/${resolvedOrderId}/${Date.now()}_${sanitized}`;

    // Subir a Firebase Storage con Admin SDK
    const bucket = admin.storage().bucket();
    const fileRef = bucket.file(storagePath);
    await fileRef.save(fileBuffer, {
      metadata: { contentType: fileMime || 'application/octet-stream' },
    });

    // Hacer el archivo accesible públicamente para lectura
    await fileRef.makePublic();
    const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // Actualizar el pedido en Firestore con Admin SDK
    await db.collection('orders').doc(resolvedOrderId).update({
      finalReceiptUrl: downloadUrl,
      finalReceiptFileName: fileName,
      finalReceiptUploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed',
    });

    console.log(`✅ Comprobante final subido para pedido ${resolvedOrderId}: ${storagePath}`);

    return res.status(200).json({
      success: true,
      message: 'Comprobante recibido y pedido marcado como completado.',
      downloadUrl,
    });
  } catch (err) {
    console.error('🔥 submitFinalReceipt error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Error interno del servidor.' });
  }
});
