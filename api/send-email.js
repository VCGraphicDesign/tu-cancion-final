// IMPORTANTE: Este archivo debe usar CommonJS, NO ES Modules
const { Resend } = require('resend');

module.exports = async (req, res) => {
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
    // OBTENER PEDIDO REAL DESDE FIREBASE
    // ======================
    const orderService = require('./services/firebase');
    const pedidoReal = await orderService.getById(orderId);

    if (!pedidoReal) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    const {
      packageInfo,
      songs,
      customerEmail,
      customerName,
      createdAt,
    } = pedidoReal;

    // Validar estructura mínima del pedido
    if (
      !packageInfo ||
      !Array.isArray(songs) ||
      songs.length === 0 ||
      !customerEmail ||
      !customerName
    ) {
      return res.status(500).json({
        success: false,
        error: 'Invalid order structure',
      });
    }

    console.log('✅ Pedido validado desde Firebase:', orderId);

    // ======================
    // INICIALIZAR RESEND
    // ======================
    const resend = new Resend(process.env.RESEND_API_KEY);

    // ======================
    // EMAIL INTERNO (ADMIN) - CON DISEÑO ORIGINAL
    // ======================
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
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
        from: process.env.EMAIL_FROM,
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
};