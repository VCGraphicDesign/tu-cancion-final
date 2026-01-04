import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderDetails, customerEmail, customerName } = req.body;

    const msg = {
      to: process.env.EMAIL_TO, // contacto@tucancion.app
      from: process.env.EMAIL_FROM, // contacto@tucancion.app
      subject: 'Nueva Solicitud de Canción',
      text: `
        Nueva solicitud recibida:
        
        Cliente: ${customerName}
        Email: ${customerEmail}
        
        Detalles del pedido:
        ${JSON.stringify(orderDetails, null, 2)}
      `,
      html: `
        <h2>Nueva Solicitud de Canción</h2>
        <p><strong>Cliente:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <h3>Detalles del pedido:</h3>
        <pre>${JSON.stringify(orderDetails, null, 2)}</pre>
      `,
    };

    await sgMail.send(msg);

    return res.status(200).json({ success: true, message: 'Email enviado' });
  } catch (error) {
    console.error('Error enviando email:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
