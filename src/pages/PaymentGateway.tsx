
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Lock } from 'lucide-react';
import { User } from '../types';

interface PaymentGatewayProps {
  user: User | null;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Obtenemos los datos enviados desde CreateRequest
  const { orderData, price } = location.state || { orderData: null, price: 0 };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulamos el proceso de pago
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-bgDark flex items-center justify-center px-4">
        <div className="bg-surface border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl animate-fade-in">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-white mb-4">¡Pago Exitoso!</h2>
          <p className="text-gray-400 mb-8">Hemos recibido tu pedido. Nuestro equipo comenzará a trabajar en tus canciones de inmediato.</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primaryDark transition-all"
          >
            Ir a Mis Pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgDark py-12 px-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-8 border-b border-white/10 bg-white/5 text-center">
            <h2 className="text-2xl font-serif font-bold text-white mb-2">Finalizar Pedido</h2>
            <p className="text-sm text-gray-400">Pago seguro y encriptado</p>
          </div>
          
          <div className="p-8">
            <div className="mb-8 p-4 bg-bgDark rounded-2xl border border-white/5">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Total del paquete:</span>
                <span>{formatMoney(price)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                <span>A pagar ahora (50%):</span>
                <span className="text-accent">{formatMoney(price / 2)}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 bg-accent text-bgDark font-bold rounded-xl hover:bg-orange-400 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg mb-6 transition-all"
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin" /> Procesando...</>
              ) : (
                <><Lock size={18} /> Pagar con Webpay</>
              )}
            </button>

            <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest">
              Garantía de satisfacción 100%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
