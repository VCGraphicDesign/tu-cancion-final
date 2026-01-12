module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('Function invoked - POST request');
    
    // Import Resend
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log('Resend initialized');
    
    // Get data from request
    const { orderDetails, customerEmail, customerName } = req.body;
    
    console.log('Processing email for:', customerEmail);
    
    // Validate
    if (!customerEmail || !customerName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: customerEmail or customerName' 
      });
    }
    
    // Send email
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
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.7;">${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</p>
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
                <p style="margin: 8px 0; font-size: 14px; color: #6c757d;"><strong>ID Pedido:</strong> ${orderDetails?.id || 'N/A'}</p>
              </div>
            </div>
            
            <!-- SECCIÓN PEDIDO -->
            <div style="padding: 25px; border-bottom: 1px solid #e9ecef;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="font-size: 24px; margin-right: 12px;">🎸</div>
                <h2 style="margin: 0; color: #2c3e50; font-size: 20px;">Detalles del Pedido</h2>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #1976d2; font-weight: bold;">PAQUETE</p>
                  <p style="margin: 5px 0 0 0; font-size: 18px; color: #2c3e50; font-weight: bold;">${orderDetails?.request?.package || 'N/A'}</p>
                </div>
                <div style="background-color: #f3e5f5; padding: 15px; border-radius: 8px; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #7b1fa2; font-weight: bold;">GÉNERO</p>
                  <p style="margin: 5px 0 0 0; font-size: 18px; color: #2c3e50; font-weight: bold;">${orderDetails?.request?.genre || 'N/A'}</p>
                </div>
                <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #f57c00; font-weight: bold;">OCASIÓN</p>
                  <p style="margin: 5px 0 0 0; font-size: 18px; color: #2c3e50; font-weight: bold;">${orderDetails?.request?.occasion || 'N/A'}</p>
                </div>
                <div style="background-color: #fce4ec; padding: 15px; border-radius: 8px; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #c2185b; font-weight: bold;">ÁNIMO</p>
                  <p style="margin: 5px 0 0 0; font-size: 18px; color: #2c3e50; font-weight: bold;">${orderDetails?.request?.mood || 'N/A'}</p>
                </div>
              </div>
              <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                <p style="margin: 0; font-size: 24px; color: #28a745; font-weight: bold; text-align: center;">$${orderDetails?.price?.toLocaleString('es-CL') || '0'}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #6c757d; text-align: center;">Precio Total</p>
              </div>
            </div>
            
            <!-- SECCIÓN INSTRUMENTOS -->
            <div style="padding: 25px; border-bottom: 1px solid #e9ecef;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="font-size: 24px; margin-right: 12px;">🎹</div>
                <h2 style="margin: 0; color: #2c3e50; font-size: 20px;">Instrumentos</h2>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${(orderDetails?.request?.instruments || []).map(instrument => 
                  `<span style="background-color: #007bff; color: white; padding: 8px 15px; border-radius: 20px; font-size: 14px; font-weight: bold;">${instrument}</span>`
                ).join('')}
              </div>
            </div>
            
            <!-- SECCIÓN HISTORIA -->
            <div style="padding: 25px; border-bottom: 1px solid #e9ecef;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="font-size: 24px; margin-right: 12px;">📖</div>
                <h2 style="margin: 0; color: #2c3e50; font-size: 20px;">Historia de la Canción</h2>
              </div>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #6c757d;">
                <p style="margin: 0; line-height: 1.6; color: #495057; font-size: 15px;">${orderDetails?.request?.storyText || 'No proporcionada'}</p>
              </div>
            </div>
            
            <!-- SECCIÓN PAGO -->
            <div style="padding: 25px;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="font-size: 24px; margin-right: 12px;">💰</div>
                <h2 style="margin: 0; color: #2c3e50; font-size: 20px;">Información de Pago</h2>
              </div>
              <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #856404; font-weight: bold;">Depósito requerido:</span>
                  <span style="color: #856404; font-size: 18px; font-weight: bold;">$${orderDetails?.depositAmount?.toLocaleString('es-CL') || '0'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #856404; font-weight: bold;">Resto a pagar:</span>
                  <span style="color: #856404; font-size: 18px; font-weight: bold;">$${((orderDetails?.price || 0) - (orderDetails?.depositAmount || 0)).toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- FOOTER -->
          <div style="background-color: #2c3e50; color: white; padding: 25px 20px; text-align: center; border-radius: 0 0 12px 12px;">
            <div style="margin-bottom: 20px;">
              <a href="#" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 0 5px;">Ver en Panel</a>
              <a href="mailto:${customerEmail}" style="background-color: #6c757d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 0 5px;">Contactar Cliente</a>
            </div>
            <p style="margin: 0; font-size: 12px; opacity: 0.7;">Este email fue generado automáticamente por Tu Canción</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.7;">Estado: <span style="color: #ffc107; font-weight: bold;">${orderDetails?.status || 'pending'}</span></p>
          </div>
        </div>
      `,
    });
    
    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
    
    console.log('Email sent successfully:', data);
    
    return res.status(200).json({ 
      success: true, 
      id: data.id,
      message: 'Email sent successfully'
    });
    
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Check Vercel logs for more information'
    });
  }
};
