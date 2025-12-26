import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Music, Play, CheckCircle, Clock, DollarSign, Upload, User, Filter, Search, Link as LinkIcon } from 'lucide-react';
import { orderService } from '../services/firebase';
import { Order, User as UserType } from '../types';

interface AdminProps {
  user: UserType | null;
}

const Admin: React.FC<AdminProps> = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Si no hay usuario, redirigir a auth
    if (user === null) {
      navigate('/auth');
      return;
    }

    // Si hay usuario pero NO es admin, redirigir a inicio
    if (user && user.email !== 'g.d.chile@gmail.com') {
      navigate('/');
      return;
    }

    // Si es admin, cargar datos
    if (user && user.email === 'g.d.chile@gmail.com') {
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
        const data = await orderService.getAll();
        setOrders(data);
    } catch (e) {
        console.error("Error loading admin data", e);
    } finally {
        setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    let url = undefined;

    if (newStatus === 'preview_ready') {
        const input = window.prompt("Ingresa el enlace del AVANCE (Google Drive):");
        if (!input) return;
        url = input;
    }

    if (newStatus === 'completed') {
        const input = window.prompt("Ingresa el enlace de descarga de la CANCIÓN FINAL:");
        if (!input) return;
        url = input;
    }

    if(!window.confirm(`¿Confirmar cambio de estado a: ${newStatus}?`)) return;
    
    setProcessingId(orderId);
    try {
        await orderService.updateStatus(orderId, newStatus, url);
        loadData();
    } catch(e) {
        alert("Error actualizando");
    } finally {
        setProcessingId(null);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const filteredOrders = orders.filter(o => {
      if (filter === 'all') return true;
      return o.status === filter;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'pending_payment': return <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20">Pendiente Pago</span>;
        case 'deposit_paid': return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">Por Producir</span>;
        case 'in_progress': return <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-bold border border-purple-500/20">En Progreso</span>;
        case 'preview_ready': return <span className="bg-accent/20 text-accent px-2 py-1 rounded text-xs font-bold border border-accent/20">Avance Listo</span>;
        case 'completed': return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/20">Completado</span>;
        default: return null;
    }
  };

  // Mostrar loading mientras verifica usuario
  if (user === null || loading) {
    return (
      <div className="min-h-screen bg-bgDark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no es admin, no mostrar nada (ya redirigió)
  if (user.email !== 'g.d.chile@gmail.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-bgDark py-12 px-4 pb-32">
        <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                        <LayoutDashboard className="text-accent" /> Panel de Producción
                    </h2>
                    <p className="text-gray-400 mt-1">Gestiona pedidos, produce canciones y entrega archivos.</p>
                </div>
                <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-white/10 overflow-x-auto max-w-full">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Todos</button>
                    <button onClick={() => setFilter('deposit_paid')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === 'deposit_paid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Por Producir</button>
                    <button onClick={() => setFilter('preview_ready')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === 'preview_ready' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>En Aprobación</button>
                    <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${filter === 'completed' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Completados</button>
                </div>
            </div>

            <div className="grid gap-6">
                {filteredOrders.length === 0 ? (
                     <div className="bg-surface border border-white/10 rounded-2xl p-12 text-center text-gray-500">
                        No hay pedidos en esta categoría.
                     </div>
                ) : filteredOrders.map((order) => (
                    <div key={order.id} className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors shadow-lg group">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-grow space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><span className="bg-white/10 text-xs px-2 py-1 rounded text-gray-300 font-mono">#{order.id.slice(0, 8)}</span><StatusBadge status={order.status} /></div>
                                    <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white">{order.request.genre} - {order.request.mood}</h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm bg-bgDark/50 p-4 rounded-xl border border-white/5">
                                    <div><p className="text-gray-500 text-xs uppercase mb-1">Cliente</p><p>{order.userId}</p></div>
                                    <div className="md:col-span-2"><p className="text-gray-500 text-xs uppercase mb-1">Historia</p><p className="italic">"{order.request.storyText}"</p></div>
                                    {(order.previewUrl || order.finalUrl) && <div className="md:col-span-2 border-t border-white/5 pt-2"><p className="text-xs text-gray-500">Links: {order.previewUrl && <a href={order.previewUrl} target="_blank" className="text-accent underline mr-2">Avance</a>} {order.finalUrl && <a href={order.finalUrl} target="_blank" className="text-primary underline">Final</a>}</p></div>}
                                </div>
                            </div>
                            <div className="lg:w-64 flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
                                <div className="text-center mb-2"><span className="block text-2xl font-bold text-white">{formatMoney(order.price)}</span></div>
                                {order.status === 'deposit_paid' && <button onClick={() => handleStatusUpdate(order.id, 'in_progress')} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"><Clock size={16} className="inline mr-1"/> En Proceso</button>}
                                {order.status === 'in_progress' && <button onClick={() => handleStatusUpdate(order.id, 'preview_ready')} className="w-full py-2 bg-accent text-bgDark font-bold rounded-lg"><Upload size={16} className="inline mr-1"/> Subir Avance</button>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
export default Admin;