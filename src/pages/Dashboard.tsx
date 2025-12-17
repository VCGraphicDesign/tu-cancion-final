import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, Play, Download, Music, X, Loader2, CreditCard, Shield, Copy, Check, ArrowRight, Mail, User as UserIcon } from 'lucide-react';
import { User, Order } from '../types';
import { orderService } from '../services/mockBackend';
import AudioPlayer from '../components/AudioPlayer';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  // Email Simulation State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailView, setEmailView] = useState<'admin' | 'client'>('admin');
  const [emailOrder, setEmailOrder] = useState<Order | null>(null);
  const [emailIsFinal, setEmailIsFinal] = useState(false);
  
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    if (user) {
        setLoading(true);
        try {
            const data = await orderService.list(user.uid);
            setOrders(data);
        } catch (err) { console.error("Error cargando pedidos:", err); } 
        finally { setLoading(false); }
    }
  };

  const handlePayDeposit = async (orderId: string) => {
    setProcessingId(orderId);
    try {
        await orderService.payDeposit(orderId);
        await loadOrders(); 
        
        // Show success simulation
        const updatedOrders = await orderService.list(user?.uid || '');
        const updatedOrder = updatedOrders.find(o => o.id === orderId);
        if (updatedOrder) {
            setEmailOrder(updatedOrder);
            setEmailIsFinal(false);
            setEmailView('admin');
            setShowEmailModal(true);
        }
    } catch (error) { alert("Error al procesar. Intenta nuevamente."); } 
    finally { setProcessingId(null); }
  };

  const handlePayFinal = (orderId: string) => navigate(`/pay/${orderId}`);
  
  const handlePreview = (url: string) => {
      const demoUrl = "https://drive.google.com/uc?export=download&id=1MDh3WHPjFOP3ovKsz9DaeQmAyiCmF_ho&confirm=t";
      setPreviewSrc(url || demoUrl);
  };
  
  const handleDownload = (url: string) => window.open(url, '_blank');
  
  const copyPaymentLink = (orderId: string) => {
      const link = `${window.location.origin}/#/pay/${orderId}`;
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
  };
  
  const openPaymentLink = (orderId: string) => {
      setShowEmailModal(false);
      navigate(`/pay/${orderId}`);
  };

  const formatMoney = (amount: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
        case 'pending_payment': return <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20">Pago Pendiente</span>;
        case 'deposit_paid':
        case 'in_progress': return <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 flex items-center gap-1"><Clock size={12} /> Producción</span>;
        case 'preview_ready': return <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20 flex items-center gap-1"><Play size={12} /> Avance</span>;
        case 'completed': return <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-1"><CheckCircle size={12} /> Listo</span>;
        default: return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bgDark py-12 px-4 relative pb-32">
        <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-serif font-bold text-white mb-2">Mis Pedidos</h2>
            <p className="text-gray-400 mb-8">Estado de tus canciones en tiempo real.</p>

            {loading ? <div className="text-center py-20 text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Cargando...</div> : orders.length === 0 ? (
                <div className="bg-surface border border-white/10 rounded-3xl p-12 text-center">
                    <Music className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">Sin canciones aún</h3>
                    <button onClick={() => navigate('/create')} className="mt-4 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primaryDark">Crear Canción</button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-white/20 shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1"><span className="text-xs font-mono text-gray-500">#{order.id.slice(0,6)}</span>{getStatusBadge(order.status)}</div>
                                    <h3 className="text-lg font-bold text-white capitalize">{order.request.genre} - {order.request.mood}</h3>
                                    <p className="text-sm text-gray-400 truncate max-w-md mt-1 italic">"{order.request.storyText.substring(0, 60)}..."</p>
                                </div>
                                <div className="text-right"><span className="block text-xl font-bold text-white">{formatMoney(order.price)}</span><span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                            </div>
                            <div className="border-t border-white/5 pt-4 flex justify-end gap-3">
                                {order.status === 'pending_payment' && (
                                    <button onClick={() => handlePayDeposit(order.id)} disabled={!!processingId} className="px-4 py-2 bg-accent text-bgDark text-sm font-bold rounded-lg hover:bg-orange-400 disabled:opacity-50">
                                        {processingId === order.id ? '...' : 'Pagar Depósito'}
                                    </button>
                                )}
                                {order.status === 'deposit_paid' && (
                                     <div className="text-xs text-gray-500 flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                                        <Clock size={14} /> Tu canción está siendo compuesta
                                    </div>
                                )}
                                {order.status === 'preview_ready' && (
                                    <>
                                        <button onClick={() => handlePreview(order.previewUrl || '')} className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20"><Play size={16}/></button>
                                        <button onClick={() => handlePayFinal(order.id)} className="px-4 py-2 bg-accent text-bgDark text-sm font-bold rounded-lg hover:bg-orange-400">Pagar Restante</button>
                                    </>
                                )}
                                {order.status === 'completed' && (
                                    <button onClick={() => handleDownload(order.finalUrl || '')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primaryDark flex gap-2"><Download size={16}/> Descargar</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Email Modal */}
        {showEmailModal && emailOrder && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                    <div className="bg-white/5 p-4 flex justify-between items-center border-b border-white/10">
                        <h3 className="font-bold text-white">Simulador de Correos</h3>
                        <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                    </div>
                    <div className="flex border-b border-white/10">
                        <button onClick={() => setEmailView('admin')} className={`flex-1 py-3 text-sm font-bold ${emailView === 'admin' ? 'bg-primary/20 text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Vista Admin</button>
                        <button onClick={() => setEmailView('client')} className={`flex-1 py-3 text-sm font-bold ${emailView === 'client' ? 'bg-accent/20 text-accent border-b-2 border-accent' : 'text-gray-400'}`}>Vista Cliente</button>
                    </div>
                    <div className="p-6 overflow-y-auto bg-white text-gray-900 text-sm leading-relaxed flex-grow">
                        {emailView === 'admin' ? (
                            <div className="space-y-4">
                                <p><strong>Asunto:</strong> {emailIsFinal ? '🎉 PAGO FINAL' : '💰 Nuevo Depósito'} - #{emailOrder.id}</p>
                                <p>Hola Admin,</p>
                                <p>El cliente <strong>{user.displayName}</strong> ha pagado {emailIsFinal ? 'el 100%' : 'el 50%'}.</p>
                                {!emailIsFinal && (
                                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                                        <p className="font-bold mb-2">Link de Cobro Final:</p>
                                        <code className="block bg-white p-2 rounded border border-blue-300 mb-2">{window.location.origin}/#/pay/{emailOrder.id}</code>
                                        <div className="flex gap-2">
                                            <button onClick={() => copyPaymentLink(emailOrder.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">{copiedLink ? 'Copiado' : 'Copiar Link'}</button>
                                            <button onClick={() => openPaymentLink(emailOrder.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Simular Cobro</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p><strong>Asunto:</strong> {emailIsFinal ? '¡Tu canción está lista!' : 'Producción iniciada'} 🎵</p>
                                <p>Hola {user.displayName},</p>
                                <p>{emailIsFinal ? 'Gracias por tu pago final. Tu canción está disponible.' : 'Hemos recibido tu depósito. Empezamos a trabajar.'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {previewSrc && (
            <div className="fixed bottom-0 left-0 w-full bg-surface border-t border-white/10 p-4 shadow-2xl z-50">
                <div className="container mx-auto max-w-4xl flex items-center gap-4">
                    <div className="flex-grow">
                         <div className="flex justify-between mb-2"><span className="text-xs font-bold text-accent">REPRODUCIENDO</span><button onClick={() => setPreviewSrc(null)}><X size={18} className="text-gray-400"/></button></div>
                         <AudioPlayer src={previewSrc} title="Avance" />
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
export default Dashboard;