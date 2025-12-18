import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Music, Heart, Star, Sparkles, ChevronRight, ChevronLeft, Mic, 
  Upload, CheckCircle2, Wand2, PlayCircle, Loader2, Zap, Gift, Music2 
} from 'lucide-react';
import { GENRES, MOODS, OCCASIONS, SINGERS, INSTRUMENTS, SongRequest, User } from '../types';

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
  discount?: string;
}

const CreateRequest: React.FC<CreateRequestProps> = ({ user }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [songsData, setSongsData] = useState<Partial<SongRequest>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // PRECIOS ACTUALIZADOS SEGÚN CAPTURA DE GOOGLE AI STUDIO
  const PACKAGES: Package[] = [
    {
      id: 'single',
      name: '1 Canción',
      songs: 1,
      price: 30000,
      description: 'Una canción personalizada perfecta para un regalo especial.',
      icon: <Music className="w-6 h-6" />
    },
    {
      id: 'double',
      name: '2 Canciones',
      songs: 2,
      price: 45000,
      description: 'Dos canciones personalizadas. ¡Ahorra con este pack!',
      icon: <div className="flex"><Music className="w-6 h-6" /><Music className="w-6 h-6 -ml-2" /></div>,
      discount: '-25%'
    },
    {
      id: 'triple',
      name: '3 Canciones',
      songs: 3,
      price: 60000,
      description: 'Tres canciones personalizadas. La mejor oferta disponible.',
      icon: <Gift className="w-6 h-6" />,
      tag: '¡MEJOR OFERTA!'
    }
  ];

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setSongsData(Array(pkg.songs).fill({
      genre: '', mood: '', occasion: '', singer: '', instruments: [], story: ''
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
      if (selectedPackage && currentSongIndex < selectedPackage.songs - 1) {
        setCurrentSongIndex(currentSongIndex + 1);
        setStep(2);
        window.scrollTo(0, 0);
      } else {
        setStep(4);
      }
    }
  };

  const handleBack = () => {
    if (step === 2 && currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
      setStep(3);
    } else {
      setStep(step - 1);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    const initialPayment = (selectedPackage?.price || 0) / 2;
    
    setTimeout(() => {
      alert(`Redirigiendo a Webpay para el Pago Inicial (50%): $${initialPayment.toLocaleString('es-CL')}`);
      setIsProcessing(false);
    }, 1500);
  };

  const currentSong = songsData[currentSongIndex] || {};

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* INDICADOR DE PASOS */}
        <div className="flex justify-between mb-12 relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -translate-y-1/2 z-0" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= i ? 'bg-orange-500 text-black' : 'bg-gray-900 text-gray-500'}`}>
              {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
            </div>
          ))}
        </div>

        {/* PASO 1: SELECCIÓN DE LAS 3 PROMOCIONES */}
        {step === 1 && (
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {PACKAGES.map((pkg) => (
              <button key={pkg.id} onClick={() => handlePackageSelect(pkg)} className="relative group bg-gray-900/50 border-2 border-gray-800 p-8 rounded-3xl text-left hover:border-orange-500 transition-all">
                {pkg.tag && <span className="absolute -top-3 right-6 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">{pkg.tag}</span>}
                {pkg.discount && <span className="absolute -top-3 right-6 bg-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">{pkg.discount}</span>}
                <div className="mb-6 p-4 bg-orange-500/10 rounded-2xl w-fit">{pkg.icon}</div>
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                <div className="text-2xl font-bold text-white mb-4">${pkg.price.toLocaleString('es-CL')}</div>
                <p className="text-gray-400 text-sm">{pkg.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* PASO 2: ESTILO */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-center">Canción {currentSongIndex + 1}: Estilo</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-500 uppercase">Género</label>
                <div className="grid grid-cols-2 gap-3">
                  {GENRES.map((g) => (
                    <button key={g.value} onClick={() => updateCurrentSong({ genre: g.value })} className={`p-4 rounded-2xl border-2 transition-all ${currentSong.genre === g.value ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-gray-800 hover:border-gray-700'}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-500 uppercase">Ánimo</label>
                <div className="grid grid-cols-2 gap-3">
                  {MOODS.map((m) => (
                    <button key={m.value} onClick={() => updateCurrentSong({ mood: m.value })} className={`p-4 rounded-2xl border-2 transition-all ${currentSong.mood === m.value ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-gray-800 hover:border-gray-700'}`}>
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
            <h2 className="text-3xl font-bold text-center">La Historia (Canción {currentSongIndex + 1})</h2>
            <textarea
              value={currentSong.story}
              onChange={(e) => updateCurrentSong({ story: e.target.value })}
              placeholder="Cuéntanos los detalles para la letra..."
              className="w-full h-64 bg-gray-900 border-2 border-gray-800 rounded-3xl p-6 text-lg focus:border-orange-500 outline-none resize-none"
            />
          </div>
        )}

        {/* PASO 4: RESUMEN CON COBRO DEL 50% */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-gray-900/50 border-2 border-gray-800 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Resumen de tu Pedido</h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                  <span className="text-gray-400">Pack Elegido:</span>
                  <span className="font-bold text-xl">{selectedPackage?.name}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Total Promoción:</span>
                  <span>${selectedPackage?.price.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-bold text-orange-500 pt-4 border-t border-gray-800">
                  <span>PAGO INICIAL (50%):</span>
                  <span>${((selectedPackage?.price || 0) / 2).toLocaleString('es-CL')}</span>
                </div>
                <p className="text-xs text-gray-500 text-center">El saldo restante se cancela al recibir tus canciones.</p>
              </div>
              <button onClick={handlePayment} disabled={isProcessing} className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-black font-bold py-4 rounded-2xl text-xl transition-all flex items-center justify-center gap-2">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Zap />}
                {isProcessing ? 'Procesando...' : 'Pagar 50% Ahora'}
              </button>
            </div>
          </div>
        )}

        {/* NAVEGACIÓN */}
        {step > 1 && step < 4 && (
          <div className="mt-12 flex justify-between max-w-2xl mx-auto">
            <button onClick={handleBack} className="px-8 py-4 rounded-2xl border-2 border-gray-800 font-bold hover:bg-gray-900 flex items-center gap-2">
              <ChevronLeft /> Anterior
            </button>
            <button onClick={handleNext} disabled={step === 2 && !currentSong.genre} className="px-12 py-4 rounded-2xl bg-white text-black font-bold hover:bg-orange-500 transition-all flex items-center gap-2 disabled:opacity-50">
              Siguiente <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRequest;