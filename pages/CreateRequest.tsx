import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Lock } from 'lucide-react';

const PaymentGateway: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">¡Pago Exitoso!</h2>
          <p className="text-gray-400 mb-8">Pedido recibido correctamente.</p>
          <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600">
            Ir a Mis Pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 flex items-center justify-center">
      <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-6">Finalizar Compra</h2>
        <button onClick={handlePayment} disabled={isProcessing} className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
          {isProcessing ? <Loader2 className="animate-spin" /> : <><Lock size={18} /> Pagar Ahora</>}
        </button>
      </div>
    </div>
  );
};

export default PaymentGateway;
