import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Menu, X, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Mantenemos la lógica de usuario como estaba originalmente
  const user = null; 

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* LOGO ORIGINAL RESTAURADO */}
          <Link to="/" onClick={handleScrollToTop} className="flex items-center gap-3">
            <img 
              src="https://lh3.googleusercontent.com/d/1nRRw1GCFuj6XKd1O3pogS1G7q8HH7Ebw" 
              alt="Haz Tu Historia Una Canción" 
              className="h-16 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#1e5d4d] leading-tight">Tu Canción</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8e9b97]">Vive tus recuerdos</span>
            </div>
          </Link>

          {/* Navegación con colores nítidos */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold text-[#1e5d4d] hover:opacity-70 transition-colors flex items-center gap-2">
              <Home size={18} />
              Inicio
            </Link>

            {/* Botón Admin integrado con el diseño */}
            <Link to="/admin" className="text-sm font-semibold text-[#1e5d4d] hover:opacity-70 transition-colors flex items-center gap-2">
              <LayoutDashboard size={18} />
              Admin
            </Link>

            <Link to="/examples" className="text-sm font-semibold text-[#1e5d4d] hover:opacity-70 transition-colors">
              Ejemplos
            </Link>
            
            <Link 
              to="/create"
              className="bg-[#007f6e] text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-[#006658] transition-all shadow-md active:scale-95"
            >
              Empezar a Crear
            </Link>
          </nav>

          <button className="md:hidden text-[#1e5d4d]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="container mx-auto px-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Tu Canción. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Layout;