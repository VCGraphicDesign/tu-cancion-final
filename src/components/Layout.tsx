import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Music, Menu, X, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Hemos simplificado esto para que la web funcione sin el archivo perdido
  const user = { name: 'Admin' }; // Simulamos un usuario para que no falle la vista
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logout = () => {
    console.log("Sesión cerrada");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" onClick={handleScrollToTop} className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <Music size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-primary">TU CANCIÓN</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" onClick={handleScrollToTop} className="text-sm font-bold text-primary hover:text-primaryDark transition-colors flex items-center gap-2">
              <Home size={18} />
              <span>Inicio</span>
            </Link>

            {/* Botón Admin que querías colocar */}
            <Link to="/admin" className="text-sm font-bold text-primary hover:text-primaryDark transition-colors flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-lg border border-primary/20">
              <LayoutDashboard size={16} /> Admin
            </Link>

            <Link to="/examples" className="text-sm font-bold text-primary hover:text-primaryDark transition-colors">
              Ejemplos
            </Link>
            
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-sm font-bold text-primary hover:text-primaryDark transition-colors">
                Mis Pedidos
              </Link>
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                <LogOut size={18} />
                Salir
              </button>
            </div>
          </nav>

          <button 
            className="md:hidden p-2 text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      <main className="flex-grow pt-24">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Tu Canción. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Layout;