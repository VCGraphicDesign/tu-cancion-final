import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Music, Heart, Star, Sparkles, ChevronRight, ChevronLeft, Mic, 
  Upload, CheckCircle2, Wand2, PlayCircle, Loader2, Zap, Gift, Music2 
} from 'lucide-react';
import { GENRES, MOODS, OCCASIONS, SINGERS, INSTRUMENTS, SongRequest, User } from '../types';
import { calculateEstimatedPrice } from '../services/mockBackend';
import { enhanceStory } from '../services/geminiservice';

interface CreateRequestProps {
  user: User | null;
}

interface Package {
  id: string;
  name: string;
  songs: number;
  price: number;
  description: string;
  icon: React.ReactNode;
  tag?: string;
}

const CreateRequest: React.FC<CreateRequestProps> = ({ user }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [songsData, setSongsData] = useState<Partial<SongRequest>[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const PACKAGES: Package[] = [
    {
      id: 'single',
      name: '1 Canción',
      songs: 1,
      price: 45000,
      description: 'Una canción personalizada perfecta para un regalo especial.',
      icon: <Music className="w-6 h-6" />
    },
    {
      id: 'double',
      name: 'Pack 2 Canciones',
      songs: 2,
      price: 75000,
      description: 'Dos canciones personalizadas. ¡Ahorra con este pack!',
      icon: <div className="flex"><Music className="w-6 h-6" /><Music className="w-6 h-6 -ml-2" /></div>,
      tag: 'Más Popular'
    }
  ];

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setSongsData(Array(pkg.songs).fill({
      genre: '',
      mood: '',
      occasion: '',
      singer: '',
      instruments: [],
      story: ''
    }));
    setStep(2);
  };

  const updateCurrentSong = (data: Partial<SongRequest>) => {
    const newSongsData = [...songsData];
    newSongsData[currentSongIndex] = { ...newSongsData[currentSongIndex], ...data };
    setSongsData(newSongsData);
  };

  const handleNext = () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (selectedPackage?.songs === 2 && currentSongIndex === 0) {
        setCurrentSongIndex(1);
        setStep(2);
        window.scrollTo(0, 0);
      } else {
        setStep(4);
      }
    }
  };

  const handleBack = () => {
    if (step === 2 && currentSongIndex === 1) {
      setCurrentSongIndex(0);
      setStep(3);
    } else {
      setStep(step - 1);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Cálculo del 50% para el pago inicial
      const totalPrice = selectedPackage?.price || 0;
      const initialPayment = totalPrice / 2;
      
      console.log(`Iniciando pago de: $${initialPayment} (50% de $${totalPrice})`);
      
      // Aquí simulamos la redirección a la pasarela
      setTimeout(() => {
        alert(`Redirigiendo a Webpay para el pago inicial del 50%: $${initialPayment.toLocaleString('es-CL')}`);
        setIsProcessing(false);
      }, 1500);

    } catch (error) {
      console.error('Error en el pago:', error);
      setIsProcessing(false);
    }
  };

  const currentSong = songsData[currentSongIndex] || {};

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* INDICADOR DE PASOS */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -translate-y-1/2 z-0" />
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                step >= i ? 'bg-orange-500 text-black scale-110' : 'bg-gray-900 text-gray-500'
              }`}
            >
              {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
            </div>
          ))}
        </div>

        {/* PASO 1: SELECCIÓN DE PAQUETE */}
        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handlePackageSelect(pkg)}
                className="relative group bg-gray-900/50 border-2 border-gray-800 p-8 rounded-3xl text-left hover:border-orange-500/50 transition-all duration-300"
              >
                {pkg.tag && (
                  <span className="absolute -top-3 right-6 bg-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {pkg.tag}
                  </span>
                )}
                <div className="mb-6 p-4 bg-orange-500/10 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  {pkg.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-gray-400 mb-6">{pkg.description}</p>
                <div className="text-3xl font-bold text-orange-500">
                  ${pkg.price.toLocaleString('es-CL')}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* PASO 2: ESTILO (GÉNERO Y MOOD) */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">
                {selectedPackage?.songs === 2 ? `Canción ${currentSongIndex + 1}: Estilo` : 'Define el estilo'}
              </h2>
              <p className="text-gray-400">Cuéntanos cómo quieres que suene tu música</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-widest text-gray-500">Género Musical</label>
                <div className="grid grid-cols-2 gap-3">
                  {GENRES.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => updateCurrentSong({ genre: g.value })}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        currentSong.genre === g.value ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-widest text-gray-500">Ánimo / Mood</label>
                <div className="grid grid-cols-2 gap-3">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => updateCurrentSong({ mood: m.value })}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        currentSong.mood === m.value ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: HISTORIA */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">La Historia</h2>
              <p className="text-gray-400">Danos los detalles para personalizar la letra</p>
            </div>

            <textarea
              value={currentSong.story}
              onChange={(e) => updateCurrentSong({ story: e.target.value })}
              placeholder="Cuéntanos para quién es, qué quieres decir, anécdotas especiales..."
              className="w-full h-64 bg-gray-900 border-2 border-gray-800 rounded-3xl p-6 text-lg focus:border-orange-500 outline-none transition-all resize-none"
            />
          </div>
        )}

        {/* PASO 4: RESUMEN Y PAGO */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gray-900/50 border-2 border-gray-800 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-orange-500" /> Resumen de tu Pedido
              </h2>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                  <span className="text-gray-400">Paquete Seleccionado</span>
                  <span className="font-bold text-xl">{selectedPackage?.name}</span>
                </div>

                {songsData.map((song, idx) => (
                  <div key={idx} className="bg-black/30 p-4 rounded-2xl border border-gray-800">
                    <p className="text-orange-500 font-bold mb-2">Canción {idx + 1}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Género:</span> {song.genre}</div>
                      <div><span className="text-gray-500">Ánimo:</span> {song.mood}</div>
                    </div>
                  </div>
                ))}

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Total del servicio</span>
                    <span>${selectedPackage?.price.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between items-center text-2xl font-bold text-orange-500 pt-2 border-t border-gray-800">
                    <span>Pago Inicial (50%)</span>
                    <span>${((selectedPackage?.price || 0) / 2).toLocaleString('es-CL')}</span>
                  </div>
                  <p className="text-xs text-gray-500 text-right">El 50% restante se paga contra entrega de la canción.</p>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full mt-8 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-black font-bold py-4 rounded-2xl text-xl transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <Zap />}
                {isProcessing ? 'Procesando...' : 'Proceder al Pago Seguro'}
              </button>
            </div>
          </div>
        )}

        {/* BOTONES DE NAVEGACIÓN INFERIOR */}
        {step > 1 && step < 4 && (
          <div className="mt-12 flex justify-between gap-4">
            <button
              onClick={handleBack}
              className="px-8 py-4 rounded-2xl border-2 border-gray-800 font-bold hover:bg-gray-900 transition-all flex items-center gap-2"
            >
              <ChevronLeft /> Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={step === 2 && !currentSong.genre}
              className="px-12 py-4 rounded-2xl bg-white text-black font-bold hover:bg-orange-500 hover:text-black transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-white"
            >
              Siguiente <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRequest;