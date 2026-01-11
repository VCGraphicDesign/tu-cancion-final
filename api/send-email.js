// IMPORTANTE: Este archivo debe usar CommonJS, NO ES Modules
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // O específicamente: 'https://www.tucancion.app'
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
    const { orderDetails, customerEmail, customerName } = req.body;

    // Validación básica
    if (!customerEmail || !customerName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: 'Nueva Solicitud de Canción - Tu Canción',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Nueva Solicitud de Canción</h2>
          <p><strong>Cliente:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <h3>Detalles del Pedido:</h3>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${JSON.stringify(orderDetails, null, 2)}</pre>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    console.log('Email sent successfully:', data);
    return res.status(200).json({ success: true, id: data.id });

  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
};
