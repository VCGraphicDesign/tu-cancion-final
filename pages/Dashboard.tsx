import React from 'react';
import { User } from '../types';
import { Clock, Music } from 'lucide-react';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
          <Clock size={40} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-white mb-4">Panel en Mantenimiento</h1>
        <p className="text-xl text-gray-400">
          Hola {user?.name || 'Usuario'}, estamos actualizando la base de datos para tus nuevas canciones.
        </p>
        <div className="mt-12">
          <a href="#/" className="text-primary hover:underline">Volver al inicio</a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
