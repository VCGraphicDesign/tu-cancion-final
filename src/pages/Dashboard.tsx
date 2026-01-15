import React, { useEffect, useState } from 'react';
import { User, Order } from '../types';
import { Music2, Clock, PlusCircle, CheckCircle, DollarSign } from 'lucide-react';
import { orderService } from '../services/firebase';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const userOrders = await orderService.list(user.uid);
      setOrders(userOrders.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'Pendiente de Pago';
      case 'deposit_paid': return 'Depósito Pagado';
      case 'in_progress': return 'En Progreso';
      case 'preview_ready': return 'Avance Listo';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
      case 'deposit_paid': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
      case 'preview_ready': return 'bg-orange-500/20 text-orange-400 border-orange-500/20';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bgDark flex items-center justify-center text-white">
        <p>Cargando sesión de usuario...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bgDark flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgDark py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-12">
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Mis Pedidos</h1>
          <p className="text-gray-400">Bienvenido {user.displayName || user.email}</p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-surface border border-white/10 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
              <Music2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aún no tienes pedidos</h3>
            <p className="text-gray-400 max-w-sm mx-auto mb-8">
              Crea tu primera canción personalizada para ver tus pedidos aquí.
            </p>
            <Link 
              to="/create" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primaryDark transition-colors"
            >
              <PlusCircle size={20} />
              Crear mi primera canción
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-surface border border-white/10 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-grow space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-white/10 text-xs px-2 py-1 rounded text-gray-300 font-mono">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white">Pedido de Canción</h3>
                    
                    {order.songsData && order.songsData.map((song, index) => (
                      <div key={index} className="mb-6 p-4 bg-surface border border-white/10 rounded-lg">
                        <h4 className="text-white font-bold mb-3">Canción {index + 1}</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs uppercase mb-1">Género</p>
                            <p>{song.genre || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase mb-1">Ánimo</p>
                            <p>{song.mood || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase mb-1">Ocasión</p>
                            <p>{song.occasion || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase mb-1">Cantante</p>
                            <p>{song.singer || 'N/A'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-gray-500 text-xs uppercase mb-1">Instrumentos</p>
                            <p>{song.instruments && song.instruments.length > 0 ? song.instruments.join(', ') : 'No especificados'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-gray-500 text-xs uppercase mb-1">Historia</p>
                            <p className="italic">"{song.story || 'No proporcionada'}"</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="md:w-48 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                    <div className="text-center">
                      <span className="block text-xl font-bold text-white">{formatMoney(order.price)}</span>
                    </div>
                    {order.previewUrl && (
                      <a 
                        href={order.previewUrl} 
                        target="_blank" 
                        className="text-center text-sm text-orange-400 hover:text-orange-300"
                      >
                        Escuchar Avance
                      </a>
                    )}
                    {order.finalUrl && (
                      <a 
                        href={order.finalUrl} 
                        target="_blank" 
                        className="text-center text-sm text-green-400 hover:text-green-300"
                      >
                        Descargar Final
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-8">
              <Link 
                to="/create" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primaryDark transition-colors"
              >
                <PlusCircle size={20} />
                Crear nueva canción
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
