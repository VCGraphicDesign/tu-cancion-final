import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutDashboard, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // URL corregida para que Google Drive permita ver la imagen directamente en la web
  const logoUrl = "https://lh3.googleusercontent.com/d/1nRRw1GCFuj6XKd1O3pogS1G7q8HH7Ebw";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* HEADER: Fondo blanco sólido, sin transparencias, letras visibles */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          
          {/* LOGO ORIGINAL DESDE TU ENLACE */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoUrl} 
              alt="Tu Canción Logo" 
              className="h-16 w-auto object-contain"
              onError={(e) => {
                // Si el enlace de Drive falla, esto evita que el diseño se rompa
                console.error("Error cargando el logo desde Drive");
              }}
            />
          </Link>

          {/* MENÚ: Colores verde oscuro (#1e5d4d) para máximo contraste sobre blanco */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-bold text-[#1e5d4d] flex items-center gap-2 hover:opacity-80">
              <Home size={18} />
              Inicio
            </Link>

            {/* BOTÓN ADMIN SOLICITADO */}
            <Link to="/admin" className="text-sm font-bold text-[#1e5d4d] flex items-center gap-2 hover:opacity-80">
              <LayoutDashboard size={18} />
              Admin
            </Link>

            <Link to="/examples" className="text-sm font-bold text-[#1e5d4d] hover:opacity-80">
              Ejemplos
            </Link>
            
            {/* BOTÓN PRINCIPAL */}
            <Link 
              to="/create"
              className="bg-[#007f6e] text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-[#006658] transition-all"
            >
              Empezar a Crear
            </Link>
          </nav>

          {/* Menú móvil */}
          <button className="md:hidden text-[#1e5d4d]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Relleno superior para que el contenido no quede oculto bajo el header blanco */}
      <main className="flex-grow pt-28">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Tu Canción. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Layout;