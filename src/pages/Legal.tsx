import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutDashboard, Menu, X, Music } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // URL de tu logo (Se mantiene intacta)
  const logoUrl = "https://lh3.googleusercontent.com/d/1nRRw1GCFuj6XKd1O3pogS1G7q8HH7Ebw";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER: Blanco sólido para que el logo transparente sea visible */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 py-3 shadow-sm">
        <div className="container mx-auto px-6 flex items-center justify-between">
          
          {/* LOGO: Dimensiones respetadas al 100% */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoUrl} 
              alt="Tu Canción Logo" 
              className="h-24 w-auto object-contain"
              style={{ minWidth: '180px' }}
            />
          </Link>

          {/* NAVEGACIÓN: Colores verdes y fuentes originales */}
          <nav className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-[15px] font-bold text-[#1e5d4d] flex items-center gap-2">
              <Home size={20} />
              Inicio
            </Link>

            <Link to="/admin" className="text-[15px] font-bold text-[#1e5d4d] flex items-center gap-2">
              <LayoutDashboard size={20} />
              Admin
            </Link>

            <Link to="/examples" className="text-[15px] font-bold text-[#1e5d4d]">
              Ejemplos
            </Link>
            
            <Link 
              to="/create"
              className="bg-[#007f6e] text-white px-9 py-3 rounded-full text-[15px] font-bold shadow-md hover:bg-[#006658] transition-all"
            >
              Empezar a Crear
            </Link>
          </nav>

          {/* Menú móvil */}
          <button className="md:hidden text-[#1e5d4d]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </header>

      {/* Cuerpo de la aplicación */}
      <main className="flex-grow pt-32">
        {children}
      </main>

      {/* FOOTER: Negro recuperado de la imagen original */}
      <footer className="bg-[#1a1a1a] text-gray-400 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            {/* Columna 1: Identidad */}
            <div>
              <div className="flex items-center gap-2 text-white mb-6">
                <Music size={24} />
                <span className="font-bold text-lg">Tu Canción</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                No dejes que se borre lo que sientes. Haz que viva siempre en una canción. Tu historia en canción.
              </p>
            </div>

            {/* Columna 2: Navegación inferior */}
            <div>
              <h4 className="text-white font-bold mb-6">Enlaces</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
                <li><Link to="/examples" className="hover:text-white transition-colors">Ejemplos</Link></li>
                <li><Link to="/create" className="hover:text-white transition-colors">Crear Canción</Link></li>
              </ul>
            </div>

            {/* Columna 3: Legal (Restaurada) */}
            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/legal#terminos" className="hover:text-white transition-colors">Términos</Link></li>
                <li><Link to="/legal#privacidad" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link to="/legal#reembolso" className="hover:text-white transition-colors">Reembolsos</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center text-xs">
            © {new Date().getFullYear()} Tu Canción. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;