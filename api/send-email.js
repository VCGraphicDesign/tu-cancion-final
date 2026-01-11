module.exports = async (req, res) => {
  try {
    console.log('=== FUNCTION CALLED ===');
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      console.log('OPTIONS request handled');
      return res.status(200).end();
    }
    
    // Log environment variables (sin mostrar valores sensibles)
    console.log('Environment check:');
    console.log('- RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('- EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('- EMAIL_TO:', process.env.EMAIL_TO);
    
    // Try to require resend
    console.log('Attempting to load Resend...');
    const { Resend } = require('resend');
    console.log('✓ Resend loaded successfully');
    
    // Try to instantiate
    console.log('Attempting to instantiate Resend...');
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✓ Resend instantiated successfully');
    
    return res.status(200).json({
      success: true,
      message: 'Function is working!',
      tests: {
        functionExecuted: true,
        resendLoaded: true,
        resendInstantiated: true,
        environmentVariables: {
          hasApiKey: !!process.env.RESEND_API_KEY,
          hasEmailFrom: !!process.env.EMAIL_FROM,
          hasEmailTo: !!process.env.EMAIL_TO
        }
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
