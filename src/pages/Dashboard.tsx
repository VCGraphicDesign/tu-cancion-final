import React from 'react';
import { User, SongRequest } from '../types';
import { Music2, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  // En un entorno real, aquí cargaríamos los pedidos desde Firebase o una API
  const mockOrders = [
    {
      id: '1',
      status: 'pending',
      date: new Date().toLocaleDateString(),
      package: 'duo',
      songs: [
        { genre: 'Pop', mood: 'Alegre', occasion: 'Cumpleaños' },
        { genre: 'Rock', mood: 'Épico', occasion: 'Aniversario' }
      ]
    }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bgDark py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-12">
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Mis Pedidos</h1>
          <p className="text-gray-400">Gestiona tus canciones personalizadas</p>
        </header>

        <div className="space-y-6">
          {mockOrders.length > 0 ? (
            mockOrders.map((order) => (
              <div key={order.id} className="bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors">
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'
                      }`}>
                        {order.status === 'completed' ? 'Completado' : 'En proceso'}
                      </span>
                      <p className="text-sm text-gray-500 mt-2">Pedido ID: #{order.id} • {order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Paquete</p>
                      <p className="text-white font-bold uppercase">{order.package}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.songs.map((song, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                          <Music2 size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">Canción {idx + 1}</p>
                          <p className="text-xs text-gray-400">{song.genre} • {song.mood} • {song.occasion}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-white/10">
              <Music2 size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Aún no tienes pedidos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
