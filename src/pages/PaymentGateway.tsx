import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Loader2, 
  Lock, 
  CreditCard, 
  Globe, 
  Wallet, 
  ExternalLink 
} from 'lucide-react';
import { User } from '../types';

interface PaymentGatewayProps {
  user: User | null;
}

// TU LISTA EXACTA DE 5 MÉTODOS (SIN CAMBIOS)
const PAYMENT_METHODS = [
  { id: 'card', label: 'Crédito/Débito', icon: <CreditCard size={24} />, color: 'border-primary' },
  { id: 'paypal', label: 'PayPal', icon: <Globe size={24} />, color: 'border-[#003087]' },
  { id: 'mercadopago', label: 'Mercado Pago', icon: <Wallet size={24} />, color: 'border-[#009EE3]' },
  { id: 'onepay', label: 'Onepay', icon: <CheckCircle2 size={24} />, color: 'border-[#f37021]' },
  { id: 'transferencia', label: 'Transferencia Directa', icon: <ExternalLink size={24} />, color: 'border-white' },
];

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    
    // Obtener datos simples del estado de navegación
    const { orderId } = location.state || {};
    
    setTimeout(async () => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Enviar correos después del pago exitoso
      try {
        const response = await fetch('https://tucancion.app/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: orderId
          })
        });
        
        const result = await response.json();
        if (result.success) {
          console.log('✅ Emails enviados correctamente');
        } else {
          console.error('❌ Error al enviar emails:', result.error);
        }
      } catch (emailError) {
        console.error('Error al enviar emails:', emailError);
      }
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl animate-in zoom-in">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">¡Pago Exitoso!</h2>
          <p className="text-gray-400 mb-8">Pedido recibido correctamente.</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
          >
            Ir a Mis Pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 flex items-center justify-center">
      <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Finalizar Compra</h2>
        
        {/* GRILLA DE MÉTODOS DE PAGO */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                selectedMethod === method.id 
                ? `${method.color} bg-white/5` 
                : 'border-gray-800 opacity-60'
              }`}
            >
              <div className="text-white">
                {method.icon}
              </div>
              <span className="font-bold text-white">
                {method.label}
              </span>
              {selectedMethod === method.id && (
                <div className="ml-auto">
                  <CheckCircle2 size={20} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing || !selectedMethod}
          className={`w-full py-4 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            !selectedMethod ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" />
          ) : (
            <><Lock size={18} /> {selectedMethod ? 'Pagar Ahora' : 'Selecciona un método'}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentGateway;