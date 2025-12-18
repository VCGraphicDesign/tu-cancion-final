import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Heart, Star, Sparkles, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

// --- TIPOS DE DATOS ---
interface SongDetails {
  genre: string;
  mood: string;
  occasion: string;
  singer: string;
  instruments: string[];
  story: string;
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

const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [step, setStep] = useState(1); // 1: Pack, 2: Estilo, 3: Historia, 4: Resumen
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [songsData, setSongsData] = useState<SongDetails[]>([]);

  // Datos temporales para la canción que se está editando
  const [tempSong, setTempSong] = useState<SongDetails>({
    genre: '', mood: '', occasion: '', singer: '', instruments: [], story: ''
  });

  // --- CONFIGURACIÓN DE LISTAS INTEGRADAS (TUS CAPTURAS + MIS COMPLEMENTOS) ---
  const GENRES = [
    "Rock", "Pop", "Balada Romántica", "Funk", "Reguetón", "Flamenco", 
    "Electrónica", "Clásica", "Folk", "Urbano", "Cumbia", "Bolero", 
    "Blues", "Tango", "Reggae", "Jazz", "Indie", "Salsa", "Bachata", "Otro"
  ];
  
  const MOODS = ["Alegre", "Triste", "Bailable", "Romántico", "Melancólico", "Inspirador", "Relajado", "Épico"];
  
  const OCCASIONS = ["Aniversario", "Cumpleaños", "Despedida", "Amor", "Nacimiento", "Matrimonio", "Graduación", "Otro"];
  
  const INSTRUMENTS = [
    "Guitarra acústica", "Guitarra eléctrica", "Bajo", "Piano", "Batería", 
    "Violín", "Saxofón", "Flauta", "Sintetizador", "Trompeta", "Percusión latina", "Cajón Flamenco"
  ];

  const PACKAGES: Package[] = [
    { id: '1', name: '1 Canción', songs: 1, price: 30000, description: 'Perfecto para un detalle único', icon: <Music className="w-8 h-8" /> },
    { id: '2', name: '2 Canciones', songs: 2, price: 45000, description: 'La segunda al 50%', icon: <Music className="w-8 h-8" />, tag: '-25%' },
    { id: '3', name: '3 Canciones', songs: 3, price: 60000, description: '¡Mejor oferta! Llevas 3 pagas 2', icon: <Star className="w-8 h-8" />, tag: '3x2 (1 Gratis)' }
  ];

  // --- LÓGICA DE NAVEGACIÓN ---
  const handleNext = () => {
    if (step === 1 && selectedPackage) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Guardar datos de la canción actual en el array global
      const updatedSongs = [...songsData];
      updatedSongs[currentSongIndex] = tempSong;
      setSongsData(updatedSongs);

      // Verificar si faltan más canciones por configurar en el paquete elegido
      if (selectedPackage && currentSongIndex < selectedPackage.songs - 1) {
        setCurrentSongIndex(currentSongIndex + 1);
        // Reiniciar datos temporales para la siguiente canción
        setTempSong({ genre: '', mood: '', occasion: '', singer: '', instruments: [], story: '' });
        setStep(2); // Volver al paso de Estilo para la nueva canción
      } else {
        setStep(4); // Ir al resumen final de todas las canciones
      }
    }
  };

  const handleBack = () => {
    if (step === 2 && currentSongIndex > 0) {
      // Si estamos en la canción 2 o 3 y volvemos atrás, regresamos a la historia de la canción anterior
      setCurrentSongIndex(currentSongIndex - 1);
      setTempSong(songsData[currentSongIndex - 1]);
      setStep(3);
    } else {
      setStep(step - 1);
    }
  };

  const toggleInstrument = (inst: string) => {
    setTempSong(prev => ({
      ...prev,
      instruments: prev.instruments.includes(inst)
        ? prev.instruments.filter(i => i !== inst)
        : [...prev.instruments, inst]
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* BARRA DE PROGRESO - ESTÉTICA VERCEL */}
        <div className="flex justify-between mb-12 relative">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step >= s ? 'bg-orange-500 border-orange-500 text-black font-bold' : 'bg-gray-900 border-gray-700'
              }`}>
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
              <span className={`text-xs mt-2 ${step >= s ? 'text-orange-500' : 'text-gray-400'}`}>
                {s === 1 ? 'Paquete' : s === 2 ? 'Estilo' : s === 3 ? 'Historia' : 'Resumen'}
              </span>
            </div>
          ))}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-800 -z-0" />
        </div>

        {/* PASO 1: SELECCIÓN DE PLANES */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center">
              <h2 className="text-4xl font-black mb-4">PLANES</h2>
              <div className="bg-orange-900/30 text-orange-400 py-2 px-6 rounded-full inline-block text-sm border border-orange-500/30 font-bold">
                ⚡ Promoción por Tiempo Limitado
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-8 rounded-3xl border-2 transition-all relative flex flex-col items-center text-center ${
                    selectedPackage?.id === pkg.id ? 'border-orange-500 bg-orange-500/5' : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'
                  }`}
                >
                  {pkg.tag && (
                    <span className="absolute -top-3 bg-orange-500 text-black text-[10px] font-black py-1 px-3 rounded-full uppercase">
                      {pkg.tag}
                    </span>
                  )}
                  <div className={`mb-4 p-4 rounded-full ${selectedPackage?.id === pkg.id ? 'text-orange-500' : 'text-gray-400'}`}>
                    {pkg.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                  <div className="text-3xl font-black mb-4">${pkg.price.toLocaleString('es-CL')}</div>
                  <p className="text-sm text-gray-500 leading-relaxed">{pkg.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: CONFIGURACIÓN DE ESTILO */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-black mb-2 uppercase italic">Estilo de Música</h2>
              {selectedPackage && selectedPackage.songs > 1 && (
                <p className="text-orange-500 font-bold">Configurando Canción {currentSongIndex + 1} de {selectedPackage.songs}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Género</label>
                <select 
                  className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                  value={tempSong.genre}
                  onChange={(e) => setTempSong({...tempSong, genre: e.target.value})}
                >
                  <option value="">Selecciona...</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Ánimo</label>
                <select 
                  className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                  value={tempSong.mood}
                  onChange={(e) => setTempSong({...tempSong, mood: e.target.value})}
                >
                  <option value="">Selecciona...</option>
                  {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Voz del Cantante</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Hombre', 'Mujer', 'Dúo Hombre y Mujer'].map(s => (
                  <button
                    key={s}
                    onClick={() => setTempSong({...tempSong, singer: s})}
                    className={`py-4 rounded-2xl border-2 font-bold transition-all ${
                      tempSong.singer === s ? 'border-orange-500 bg-orange-500 text-black' : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Instrumentos Sugeridos</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INSTRUMENTS.map(inst => (
                  <button
                    key={inst}
                    onClick={() => toggleInstrument(inst)}
                    className={`py-3 px-4 rounded-xl border transition-all text-sm font-medium ${
                      tempSong.instruments.includes(inst) 
                        ? 'border-orange-500 bg-orange-500/10 text-orange-500' 
                        : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {inst}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: HISTORIA */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-black mb-2 uppercase italic">Tu Historia</h2>
              <p className="text-gray-400">Cuéntanos todo lo que quieres que exprese la canción {selectedPackage && selectedPackage.songs > 1 && `${currentSongIndex + 1}`}</p>
            </div>
            <textarea
              className="w-full h-80 bg-gray-900 border border-gray-700 rounded-3xl p-8 focus:border-orange-500 outline-none resize-none text-lg leading-relaxed transition-all"
              placeholder="Ej: Es para mi esposa por nuestro 10° aniversario. Nos conocimos en la universidad, ella ama las rosas rojas y siempre recordamos nuestro primer viaje a la playa..."
              value={tempSong.story}
              onChange={(e) => setTempSong({...tempSong, story: e.target.value})}
            />
          </div>
        )}

        {/* PASO 4: RESUMEN FINAL */}
        {step === 4 && (
          <div className="space-y-8 text-center animate-in zoom-in duration-500">
            <div className="flex justify-center mb-4 text-orange-500">
              <CheckCircle2 className="w-16 h-16" />
            </div>
            <h2 className="text-4xl font-black uppercase italic">¡Resumen de tu Pedido!</h2>
            <div className="bg-gray-900 p-10 rounded-[2rem] border border-gray-800 max-w-lg mx-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Paquete Seleccionado</span>
                <span className="font-black text-xl">{selectedPackage?.name}</span>
              </div>
              <div className="space-y-2 mb-8">
                {songsData.map((song, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-gray-500">
                    <span>Canción {idx + 1}:</span>
                    <span>{song.genre} / {song.singer}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-3xl border-t border-gray-800 pt-8">
                <span className="font-bold">TOTAL</span>
                <span className="font-black text-orange-500">${selectedPackage?.price.toLocaleString('es-CL')}</span>
              </div>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-black font-black py-5 px-16 rounded-full text-2xl transition-all transform hover:scale-105 shadow-xl shadow-orange-500/20 uppercase italic">
              Proceder al Pago
            </button>
          </div>
        )}

        {/* BOTONES DE NAVEGACIÓN INFERIOR */}
        {step < 4 && (
          <div className="mt-16 flex justify-between items-center">
            {step > 1 && (
              <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-white font-bold transition-all uppercase text-sm tracking-widest">
                <ChevronLeft className="w-5 h-5" /> Anterior
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={handleNext}
              disabled={(step === 1 && !selectedPackage) || (step === 2 && !tempSong.genre) || (step === 3 && !tempSong.story)}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black py-4 px-10 rounded-full flex items-center gap-2 transition-all transform hover:translate-x-1 uppercase text-sm tracking-widest shadow-lg shadow-orange-500/20"
            >
              {step === 3 && selectedPackage && currentSongIndex < selectedPackage.songs - 1 ? 'Siguiente Canción' : 'Continuar'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRequest;