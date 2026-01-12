// IMPORTANTE: Este archivo debe usar CommonJS, NO ES Modules
const { Resend } = require('resend');

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
    
    // Get data from request - NUEVA ESTRUCTURA
    const { packageInfo, songs, customerEmail, customerName, orderDate } = req.body;
    
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
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.7;">${new Date(orderDate).toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</p>
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