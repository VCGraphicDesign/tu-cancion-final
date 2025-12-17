import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CreditCard, Lock, ArrowLeft, CheckCircle2, ShieldCheck, ExternalLink, Wallet, Globe, Loader2, XCircle } from 'lucide-react';
import { orderService } from '../services/mockBackend';
import { User, SongRequest, Order } from '../types';

interface PaymentGatewayProps {
  user: User | null;
}

interface LocationState {
  orderData?: SongRequest;
  price?: number;
}

const PAYMENT_METHODS = [
  { id: 'card', label: 'Crédito/Débito', icon: <CreditCard size={24} />, color: 'border-primary' },
  { id: 'paypal', label: 'PayPal', icon: <Globe size={24} />, color: 'border-[#003087]' },
  { id: 'mercadopago', label: 'Mercado Pago', icon: <Wallet size={24} />, color: 'border-[#009EE3]' },
  { id: 'onepay', label: 'Onepay', icon: <ShieldCheck size={24} />, color: 'border-[#f37021]' },
  { id: 'transferencia', label: 'Transf. Bancaria', icon: <ExternalLink size={24} />, color: 'border-white' },
];

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams<{ orderId: string }>();
  
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [existingOrder, setExistingOrder] = useState<Order | null>(null);
  const [method, setMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Card Form
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [errors, setErrors] = useState<{[key:string]: boolean}>({});

  const state = location.state as LocationState;
  
  useEffect(() => {
    if (orderId) {
        setLoadingOrder(true);
        orderService.getOrder(orderId).then(order => {
            if (order) {
                setExistingOrder(order);
                if (order.status === 'completed') setShowSuccess(true);
            } else {
                alert("Pedido no encontrado");
                navigate('/');
            }
            setLoadingOrder(false);
        });
    } else if (!user || (!state?.orderData && !state?.price)) {
      navigate('/create');
    }
  }, [user, state, navigate, orderId]);

  if (loadingOrder) return <div className="min-h-screen bg-bgDark flex items-center justify-center text-primary"><Loader2 className="animate-spin mr-2"/> Cargando...</div>;
  if (!user && !orderId) return null;

  const isFinalPayment = !!existingOrder && (existingOrder.status === 'deposit_paid' || existingOrder.status === 'preview_ready');
  const requestData = existingOrder ? existingOrder.request : state?.orderData;
  const totalPrice = existingOrder ? existingOrder.price : (state?.price || 0);
  const amountToPay = totalPrice / 2;

  if (!requestData) return null;

  const validateForm = () => {
    const newErrors: {[key:string]: boolean} = {};
    if(cardNumber.length < 16) newErrors.cardNumber = true;
    if(expiry.length < 4) newErrors.expiry = true;
    if(cvc.length < 3) newErrors.cvc = true;
    if(cardName.length < 3) newErrors.cardName = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if(method === 'card' && !validateForm()) return;

    setIsProcessing(true);
    try {
      let order;
      if (isFinalPayment && existingOrder) {
          order = await orderService.payFinal(existingOrder.id);
      } else if (user && requestData) {
          order = await orderService.create(user.uid, requestData as SongRequest);
      }
      
      if (order) {
          setTimeout(() => {
            setIsProcessing(false);
            setShowSuccess(true);
          }, 2000);
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert("Error en el pago.");
    }
  };

  const formatMoney = (amount: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  if (showSuccess) {
      return (
          <div className="fixed inset-0 bg-bgDark z-50 flex items-center justify-center p-4">
              <div className="bg-surface border border-white/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={48} className="text-green-500" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-2">¡Pago Exitoso!</h2>
                  <p className="text-gray-400 mb-8">{isFinalPayment ? 'Canción liberada.' : 'Producción iniciada.'}</p>
                  <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-primary text-white font-bold rounded-xl">Ir a Mis Pedidos</button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-bgDark py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"><ArrowLeft size={20} /> Volver</button>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 order-2 md:order-1">
            <div className="bg-surface border border-white/10 rounded-2xl p-6 sticky top-24">
              <h3 className="text-xl font-serif font-bold text-white mb-6 border-b border-white/10 pb-4">Resumen</h3>
              <div className="space-y-4 mb-6">
                <div><p className="text-white font-medium">{isFinalPayment ? 'Pago Final' : 'Depósito Inicial'}</p><p className="text-sm text-gray-400">{requestData.genre}</p></div>
              </div>
              <div className="bg-black/20 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-accent font-bold text-lg pt-2"><span>Total a Pagar</span><span>{formatMoney(amountToPay)}</span></div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 order-1 md:order-2">
            <h2 className="text-3xl font-serif font-bold text-white mb-8">Método de Pago</h2>
            <div className="bg-surface border border-white/10 rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {PAYMENT_METHODS.map((m) => (
                    <button key={m.id} onClick={() => setMethod(m.id)} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 h-32 ${method === m.id ? `bg-white/5 ${m.color} text-white border-2` : 'bg-transparent border-white/10 text-gray-400'}`}>{m.icon}<span className="font-bold text-xs">{m.label}</span></button>
                ))}
              </div>
              
              {method === 'card' ? (
                  <form onSubmit={handlePayment} className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-sm text-gray-400">Nombre en Tarjeta</label>
                          <input type="text" value={cardName} onChange={e=>setCardName(e.target.value)} className={`w-full bg-bgDark border rounded-lg h-12 px-4 text-white ${errors.cardName ? 'border-red-500' : 'border-white/10'}`} placeholder="Juan Pérez"/>
                      </div>
                      <div className="space-y-2">
                          <label className="text-sm text-gray-400">Número de Tarjeta</label>
                          <input type="text" value={cardNumber} onChange={e=>setCardNumber(e.target.value.replace(/\D/g,'').substring(0,16))} className={`w-full bg-bgDark border rounded-lg h-12 px-4 text-white ${errors.cardNumber ? 'border-red-500' : 'border-white/10'}`} placeholder="0000 0000 0000 0000"/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                                <label className="text-sm text-gray-400">Vencimiento</label>
                                <input type="text" value={expiry} onChange={e=>setExpiry(e.target.value)} className={`w-full bg-bgDark border rounded-lg h-12 px-4 text-white ${errors.expiry ? 'border-red-500' : 'border-white/10'}`} placeholder="MM/AA"/>
                           </div>
                           <div className="space-y-2">
                                <label className="text-sm text-gray-400">CVC</label>
                                <input type="text" value={cvc} onChange={e=>setCvc(e.target.value)} className={`w-full bg-bgDark border rounded-lg h-12 px-4 text-white ${errors.cvc ? 'border-red-500' : 'border-white/10'}`} placeholder="123"/>
                           </div>
                      </div>
                      <button type="submit" disabled={isProcessing} className="w-full h-14 bg-accent text-bgDark font-bold text-lg rounded-xl flex items-center justify-center gap-2 mt-4">
                        {isProcessing ? 'Procesando...' : `Pagar ${formatMoney(amountToPay)}`} <ShieldCheck size={20} />
                      </button>
                  </form>
              ) : (
                  <button onClick={handlePayment} disabled={isProcessing} className="w-full h-14 bg-accent text-bgDark font-bold text-lg rounded-xl flex items-center justify-center gap-2">
                    {isProcessing ? 'Procesando...' : `Pagar ${formatMoney(amountToPay)} con ${PAYMENT_METHODS.find(m=>m.id===method)?.label}`} <ShieldCheck size={20} />
                  </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PaymentGateway;
