import React from 'react';
import { User } from '../types';

interface AdminProps {
  user: User | null;
}

const Admin: React.FC<AdminProps> = ({ user }) => {
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-bgDark flex items-center justify-center p-4">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-gray-400">No tienes permisos para ver esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgDark py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-serif font-bold text-white mb-8">Panel de Administración</h2>
        <div className="bg-surface border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400">Cargando pedidos...</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
