import React, { useState, useEffect } from 'react';
import { Menu, X, Music, LogOut, Home, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { User as UserType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserType | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname === '/auth';
  
  // DEMO MODE: All logged in users can see admin panel
  const isAdmin = !!user; 

  useEffect(() => {
    // Scroll to top on route change unless it's a hash link
    if (!location.hash) {
       window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  const handleScrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsMobileMenuOpen(false);
  };

  if (isAuthPage) {
    return <main className="min-h-screen bg-bgDark text-white">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-bgDark text-white font-sans">
      {/* Header - White Background */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-primary/10">
        <div className="container mx-auto px-4 h-28 flex items-center justify-between">
          <Link to="/" onClick={handleScrollToTop} className="flex items-center gap-3 group">
            {/* Logo Image */}
            <img 
              src="https://i.ibb.co/N2R8tbgC/Copilot-20251205-144321.png" 
              alt="Logo Tu Canción" 
              className="w-24 h-24 object-contain group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('fallback-icon-visible');
              }}
            />
            {/* Fallback Icon */}
            <div className="hidden fallback-icon w-10 h-10 rounded-full bg-primary items-center justify-center group-hover:bg-primaryDark transition-colors">
               <Music className="w-6 h-6 text-white" />
            </div>
            
            <div>
              {/* Text updated to Primary Green */}
              <h1 className="text-2xl font-bold tracking-tight font-serif text-primary">Tu Canción</h1>
              <p className="text-xs text-primary/70 uppercase tracking-widest hidden sm:block">Vive tus recuerdos</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" onClick={handleScrollToTop} className="text-sm font-bold text-primary hover:text-primaryDark transition-colors flex items-center gap-2">
              <Home size={18} />
              <span>Inicio</span>
            </Link>

            {/* Botón Admin - Acceso Directo */}
            <Link to="/admin" className="text-sm font-bold text-primary hover:text-primaryDark transition-colors flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-lg border border-primary/20">
              <LayoutDashboard size={16} /> Admin
            </Link>

            <Link 
              to="/examples" 
              className="text-sm font-bold text-primary hover:text-primaryDark transition-colors cursor-pointer"
            >
              Ejemplos
            </Link>
              Ejemplos
            </Link>
            
            {user ? (
              <div className="flex items-center gap-6">
                 {isAdmin && (
                    <Link to="/admin" className="text-sm font-bold text-primary hover:text-primaryDark transition-colors flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-lg border border-primary/20">
                        <LayoutDashboard size={16} /> Admin
                    </Link>
                 )}
                 <Link to="/dashboard" className="text-sm font-bold text-primary hover:text-primaryDark transition-colors">Mis Pedidos</Link>
                 <div className="flex items-center gap-3 pl-6 border-l border-primary/10">
                    <span className="text-sm text-primary font-medium">{user.displayName}</span>
                    <button 
                      onClick={onLogout}
                      className="p-2 hover:bg-primary/5 rounded-full transition-colors text-primary/60 hover:text-red-500"
                      title="Cerrar sesión"
                    >
                      <LogOut size={18} />
                    </button>
                 </div>
                 <Link to="/create" className="px-5 py-2 bg-primary text-white font-bold rounded-full hover:bg-primaryDark transition-colors shadow-md hover:shadow-lg">
                    Empezar a Crear
                 </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                 <Link to="/auth" className="px-5 py-2 bg-primary text-white font-bold rounded-full hover:bg-primaryDark transition-colors shadow-sm">
                    <span>Empezar a Crear</span>
                 </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-28 left-0 w-full bg-white border-b border-primary/10 p-4 flex flex-col gap-4 shadow-xl z-50">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-primary hover:bg-primary/5 rounded-lg px-4 flex items-center gap-2 font-bold">
              <Home size={18} />
              <span>Inicio</span>
            </Link>
            <Link 
              to="/examples" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 text-primary hover:bg-primary/5 rounded-lg px-4 flex items-center gap-2 font-bold"
            >
              Ejemplos
            </Link>
            {user ? (
              <>
                {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-primary hover:bg-primary/5 rounded-lg px-4 font-bold flex items-center gap-2">
                        <LayoutDashboard size={18} /> Panel Admin
                    </Link>
                )}
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-primary hover:bg-primary/5 rounded-lg px-4 font-bold">Mis Pedidos</Link>
                <div className="border-t border-primary/10 my-2"></div>
                <div className="flex items-center justify-between py-2 px-4 text-primary">
                  <span className="font-medium">{user.displayName}</span>
                  <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="text-red-500 text-sm font-bold">Salir</button>
                </div>
                <Link to="/create" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center py-3 bg-primary text-white font-bold rounded-lg mt-2 shadow-sm">
                  Empezar a Crear
                </Link>
              </>
            ) : (
              <>
                 <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center py-3 bg-primary text-white font-bold rounded-lg shadow-sm">
                    <span>Empezar a Crear</span>
                 </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface py-12 border-t border-white/5 mt-auto">
         <div className="container mx-auto px-4 text-center md:text-left">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
               <div className="md:col-span-2">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Music className="w-4 h-4 text-white" />
                     </div>
                     <span className="font-serif text-lg font-bold text-white">Tu Canción</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
                    No dejes que se borre lo que sientes. Haz que viva siempre en una canción. Tu historia en canción.
                  </p>
               </div>
               <div>
                  <h4 className="font-bold mb-4 text-white">Enlaces</h4>
                  <ul className="space-y-2 text-sm text-white">
                     <li>
                        <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
                     </li>
                     <li>
                        <Link to="/examples" className="hover:text-accent transition-colors">Ejemplos</Link>
                     </li>
                     <li>
                        <Link to="/create" className="hover:text-accent transition-colors">Crear Canción</Link>
                     </li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold mb-4 text-white">Legal</h4>
                  <ul className="space-y-2 text-sm text-white">
                     <li><Link to="/legal#terminos" className="hover:text-accent transition-colors">Términos</Link></li>
                     <li><Link to="/legal#privacidad" className="hover:text-accent transition-colors">Privacidad</Link></li>
                     <li><Link to="/legal#reembolso" className="hover:text-accent transition-colors">Reembolsos</Link></li>
                  </ul>
               </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
               © 2024 Tu Canción. Todos los derechos reservados.
            </div>
         </div>
      </footer>
      <style>{`
        .fallback-icon-visible .fallback-icon {
          display: flex !important;
        }
      `}</style>
    </div>
  );
};

export default Layout;
