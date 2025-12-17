import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">Tu Canción</Link>
          <div className="space-x-4">
            <Link to="/" className="hover:text-primary">Inicio</Link>
            <Link to="/examples" className="hover:text-primary">Ejemplos</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-primary">Mi Panel</Link>
                <button onClick={onLogout} className="text-red-500">Salir</button>
              </>
            ) : (
              <Link to="/auth" className="hover:text-primary">Entrar</Link>
            )}
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
