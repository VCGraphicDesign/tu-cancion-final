import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutDashboard, Menu, X } from 'lucide-react';

interface LayoutProps {
  user: any; onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // URL de tu logo en Drive (Ruta directa para visualización)
  const logoUrl = "https://lh3.googleusercontent.com/d/1nRRw1GCFuj6XKd1O3pogS1G7q8HH7Ebw";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* HEADER: Fondo blanco sólido garantizado, sin transparencias */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 py-3 shadow-sm">
        <div className="container mx-auto px-6 flex items-center justify-between">
          
          {/* LOGO: Tamaño recuperado para que sea legible y protagonista */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoUrl} 
              alt="Tu Canción Logo" 
              className="h-24 w-auto object-contain"
              style={{ minWidth: '180px' }}
            />
          </Link>

          {/* NAVEGACIÓN: Todos los elementos presentes con color verde oscuro (#1e5d4d) */}
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

          {/* Menú móvil (Iconos aumentados para visibilidad) */}
          <button className="md:hidden text-[#1e5d4d]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </header>

      {/* Ajuste de espacio para que el header blanco no tape tu contenido */}
      <main className="flex-grow pt-32">
        {children}
      </main>

      <footer className="bg-[#121212] text-gray-400 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            {/* Columna 1 */}
            <div>
              <div className="flex items-center gap-2 text-white font-bold mb-4">
                <Music size={20} />
                <span>Tu Canción</span>
              </div>
              <p className="text-sm leading-relaxed">
                No dejes que se borre lo que sientes. Haz que viva siempre en una canción. Tu historia en canción.
              </p>
            </div>

            {/* Columna 2 */}
            <div>
              <h4 className="text-white font-bold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
                <li><Link to="/ejemplos" className="hover:text-white transition-colors">Ejemplos</Link></li>
                <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-white transition-colors">Crear Canción</button></li>
              </ul>
            </div>

            {/* Columna 3 */}
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/legal#terminos" className="hover:text-white transition-colors">Términos</Link></li>
                <li><Link to="/legal#privacidad" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link to="/legal#reembolsos" className="hover:text-white transition-colors">Reembolsos</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs">
            © {new Date().getFullYear()} Tu Canción. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;