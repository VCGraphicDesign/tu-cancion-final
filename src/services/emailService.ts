import { MailService } from '@sendgrid/mail';

const sgMail = new MailService();
sgMail.setApiKey((import.meta as any).env.VITE_SENDGRID_API_KEY || '');

export const emailService = {
  sendOrderNotification: async (orderData: any, userData: any) => {
    console.log('📧 Intentando enviar email...');
    console.log('📧 API Key disponible:', !!(import.meta as any).env.VITE_SENDGRID_API_KEY);
    
    const msg = {
      to: 'contacto@tucancion.app',
      from: 'contacto@tucancion.app',
      subject: 'Nuevo Pedido de Canción - Tu Canción',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Nuevo Pedido de Canción</h1>
            <p style="margin: 10px 0; font-size: 16px;">Has recibido un nuevo pedido en tu aplicación</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Datos del Cliente</h2>
            <p><strong>Email:</strong> ${userData.email || 'No proporcionado'}</p>
            <p><strong>Nombre:</strong> ${userData.displayName || 'No proporcionado'}</p>
            <p><strong>UID:</strong> ${userData.uid || 'No proporcionado'}</p>
            
            <h2 style="color: #333; margin-top: 20px;">Detalles del Pedido</h2>
            <p><strong>Paquete:</strong> ${orderData.packageInfo?.name || 'No especificado'}</p>
            <p><strong>ID del Paquete:</strong> ${orderData.packageInfo?.id || 'No especificado'}</p>
            <p><strong>Cantidad de Canciones:</strong> ${orderData.packageInfo?.songs || 'No especificado'}</p>
            <p><strong>Precio:</strong> $${(orderData.price || 0).toLocaleString('es-CL')}</p>
            
            <h2 style="color: #333; margin-top: 20px;">Detalles de las Canciones</h2>
            ${orderData.songs && orderData.songs.length > 0 ? orderData.songs.map((song: any, index: number) => `
              <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 10px; border-radius: 5px; border-left: 4px solid #2563eb;">
                <h3 style="color: #333; margin-top: 0;">Canción ${index + 1}</h3>
                <p><strong>Género:</strong> ${song.genre || 'No especificado'}</p>
                <p><strong>Estado de Ánimo:</strong> ${song.mood || 'No especificado'}</p>
                <p><strong>Ocasión:</strong> ${song.occasion || 'No especificado'}</p>
                <p><strong>Instrumentos:</strong> ${song.instruments && song.instruments.length > 0 ? song.instruments.join(', ') : 'No especificados'}</p>
                <p><strong>Voz Preferida:</strong> ${song.singer || 'No especificado'}</p>
                <p><strong>Historia:</strong> ${song.story || 'No especificada'}</p>
              </div>
            `).join('') : '<p>No hay detalles de canciones</p>'}
            
            <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 5px; text-align: center;">
              <p style="margin: 0; color: #0066cc;"><strong>Importante:</strong> Revisa tu panel de administración para gestionar este pedido.</p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Email de pedido enviado correctamente');
    } catch (error) {
      console.error('❌ Error al enviar email de pedido:', error);
      throw error;
    }
  }
};
