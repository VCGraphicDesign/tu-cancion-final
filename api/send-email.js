module.exports = async (req, res) => {
  try {
    // Test 1: Función básica funciona
    console.log('=== FUNCTION CALLED ===');
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    
    // Test 2: Variables de entorno existen
    console.log('Environment check:');
    console.log('- RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('- EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('- EMAIL_TO:', process.env.EMAIL_TO);
    
    // Test 3: CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      console.log('OPTIONS request handled');
      return res.status(200).end();
    }
    
    // Test 4: Resend se puede importar
    console.log('Attempting to load Resend...');
    const { Resend } = require('resend');
    console.log('✓ Resend loaded successfully');
    
    // Test 5: Resend se puede instanciar
    console.log('Attempting to instantiate Resend...');
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✓ Resend instantiated successfully');
    
    return res.status(200).json({ 
      success: true, 
      message: 'All tests passed',
      env: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        emailFrom: process.env.EMAIL_FROM,
        emailTo: process.env.EMAIL_TO
      }
    });
    
  } catch (error) {
    console.error('=== ERROR IN FUNCTION ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
};
