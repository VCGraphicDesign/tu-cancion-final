import React from 'react';
import { User } from '../types';
import { Music2, Clock, PlusCircle } from 'lucide-react';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  if (!user) {
    return (
      <div className="min-h-screen bg-bgDark flex items-center justify-center text-white">
        <p>Cargando sesión de usuario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgDark py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-12">
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Mis Pedidos</h1>
          <p className="text-gray-400">Bienvenido a tu panel personal</p>
        </header>

        <div className="bg-surface border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
            <Clock size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Panel en Actualización</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-8">
            Tu pedido se ha procesado con éxito. Estamos adaptando la vista para mostrar tus múltiples canciones correctamente.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="#/create" 
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primaryDark transition-colors"
            >
              <PlusCircle size={20} />
              Crear nueva canción
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
