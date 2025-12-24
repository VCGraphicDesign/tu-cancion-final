
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Quote, Music2, Gift } from 'lucide-react';
import { User } from '../types';

interface HomeProps {
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  // If user is logged in, CTAs go to Create. If not, they go to Auth.
  const ctaLink = (user && user.uid) ? "/create" : "/auth";

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-bgDark to-bgDark pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[linear-gradient(to_top,_#0B0B0B_0%,_transparent_100%)] pointer-events-none" />

        <div className="container mx-auto relative z-10 max-w-4xl text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold tracking-widest uppercase mb-6 animate-fade-in-up">
                Canciones personalizadas para ti
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                No dejes que se borre <br />
                <span className="text-white">lo que sientes.</span>
            </h1>
            <p className="text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto leading-relaxed">
                Haz que viva siempre en una canción. Tu historia en canción.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                    to={ctaLink}
                    className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primaryDark text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,105,92,0.4)] flex items-center justify-center gap-2"
                >
                    Empezar a Crear <ChevronRight size={20} />
                </Link>
                <Link 
                    to="/examples"
                    className="w-full sm:w-auto px-8 py-4 bg-accent text-bgDark font-bold rounded-full hover:bg-orange-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(243,156,18,0.3)] text-center"
                >
                    Escuchar Ejemplos
                </Link>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 transition-colors">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6">
                        <Quote className="text-primary" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Letra Profesional</h3>
                    <p className="text-gray-400">
                        Transformamos tus anécdotas y sentimientos en versos poéticos con métrica y rima profesional.
                    </p>
                </div>
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 transition-colors">
                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-6">
                        <Music2 className="text-accent" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Producción de Estudio</h3>
                    <p className="text-gray-400">
                        Músicos reales e instrumentación de calidad. Nada de sonidos MIDI baratos.
                    </p>
                </div>
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/50 transition-colors">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                        <Gift className="text-purple-400" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Entrega Digital</h3>
                    <p className="text-gray-400">
                        Recibe tu canción en alta calidad, lista para dedicar, compartir o subir a redes sociales.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Final CTA Button */}
      <section className="py-20 px-4">
        <div className="container mx-auto flex justify-center">
            <Link 
                to={ctaLink}
                className="px-12 py-5 bg-primary hover:bg-primaryDark text-white text-xl font-bold rounded-full transition-all transform hover:scale-105 shadow-[0_0_25px_rgba(0,105,92,0.5)] flex items-center gap-3"
            >
                Empezar a Crear <ChevronRight size={24} />
            </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
