const { Resend } = require('resend');

export default async function handler(req, res) {
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
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { orderDetails, customerEmail, customerName } = req.body;

    const data = await resend.emails.send({
      from: 'contacto@tucancion.app',
      to: 'contacto@tucancion.app',
      subject: 'Nueva Solicitud de Canción - Tu Canción',
      html: `
        <h2>Nueva Solicitud de Canción</h2>
        <p><strong>Cliente:</strong> ${customerName || 'No especificado'}</p>
        <p><strong>Email:</strong> ${customerEmail || 'No especificado'}</p>
        <h3>Detalles del pedido:</h3>
        <pre>${JSON.stringify(orderDetails, null, 2)}</pre>
      `,
    });

    return res.status(200).json({ success: true, id: data.id });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
