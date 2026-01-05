const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderDetails, customerEmail, customerName } = req.body;

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: 'Nueva Solicitud de Canción - Tu Canción',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Nueva Solicitud de Canción</h1>
            <p style="margin: 10px 0; font-size: 16px;">Has recibido un nuevo pedido en tu aplicación</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Datos del Cliente</h2>
            <p><strong>Email:</strong> ${customerEmail || 'No proporcionado'}</p>
            <p><strong>Nombre:</strong> ${customerName || 'No proporcionado'}</p>
            
            <h2 style="color: #333; margin-top: 20px;">Detalles del Pedido</h2>
            <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 10px; border-radius: 5px; border-left: 4px solid #2563eb;">
              <h3 style="color: #333; margin-top: 0;">Canción 1</h3>
              <p><strong>Paquete:</strong> ${orderDetails.package || 'No especificado'}</p>
              <p><strong>Género:</strong> ${orderDetails.genre || 'No especificado'}</p>
              <p><strong>Ánimo:</strong> ${orderDetails.mood || 'No especificado'}</p>
              <p><strong>Ocasión:</strong> ${orderDetails.occasion || 'No especificado'}</p>
              <p><strong>Voz:</strong> ${orderDetails.singer || 'No especificado'}</p>
              <p><strong>Instrumentos:</strong> ${orderDetails.instruments && orderDetails.instruments.length > 0 ? orderDetails.instruments.join(', ') : 'No especificados'}</p>
              <p><strong>Historia:</strong> ${orderDetails.storyText || 'No especificada'}</p>
              <p><strong>Precio:</strong> $${(orderDetails.price || 0).toLocaleString('es-CL')}</p>
              <p><strong>Cliente Email:</strong> ${orderDetails.customerEmail || 'No especificado'}</p>
              <p><strong>Cliente Nombre:</strong> ${orderDetails.customerName || 'No especificado'}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 5px; text-align: center;">
              <p style="margin: 0; color: #0066cc;"><strong>Importante:</strong> Revisa tu panel de administración para gestionar este pedido.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('Email enviado:', data);
    return res.status(200).json({ success: true, id: data.id });

  } catch (error) {
    console.error('Error enviando email:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
