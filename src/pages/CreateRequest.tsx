import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Zap, Gift, ChevronRight } from 'lucide-react';
import { orderService } from '../services/firebase';

// LISTAS COMPLETAS MANTENIDAS INTACTAS
const GÉNEROS_OPCIONES = [
  "rock", "pop", "balada romántica", "Funk", "reggaetón", "Flamenco", 
  "electrónica", "reggae", "clásica", "folk", "bolero", "blues", "tango"
];

const ÁNIMOS_OPCIONES = [
  "alegre", "triste", "bailable", "romántico", "melancólico", "inspirador", "relajado"
];

const OCASIONES_OPCIONES = [
  "aniversario", "despedida", "cumpleaños", "amor", "nacimiento", "matrimonio", "graduación"
];

const INSTRUMENTOS_OPCIONES = [
  "guitarra acústica", "guitarra eléctrica", "bajo", "batería", "piano", "violín", 
  "saxofón", "flauta", "trompeta", "percusión latina", "cajón Flamenco", "sintetizador", "ukelele"
];

const VOCES_OPCIONES = [
  "hombre", "mujer", "Dúo mujer y hombre"
];

interface Package {
  id: string;
  name: string;
  songs: number;
  price: number;
  icon: React.ReactNode;
  discount?: string;
  tag?: string;
}

interface CreateRequestProps {
  user: any;
}

const CreateRequest: React.FC<CreateRequestProps> = ({ user }) => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [songsData, setSongsData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const PACKAGES: Package[] = [
    { id: '1', name: '1 Canción', songs: 1, price: 30000, icon: <Music className="w-5 h-5" /> },
    { id: '2', name: '2 Canciones', songs: 2, price: 45000, icon: <div className="flex gap-0.5"><Music className="w-4 h-4"/><Music className="w-4 h-4"/></div>, discount: '-25%' },
    { id: '3', name: '3 Canciones', songs: 3, price: 60000, icon: <Gift className="w-5 h-5" />, tag: '¡MEJOR OFERTA!' }
  ];

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setSongsData(Array(pkg.songs).fill({ genre: '', mood: '', occasion: '', instruments: [], singer: '', story: '' }));
    setStep(2);
    setSubStep(1);
    setCurrentSongIndex(0);
  };

  const updateCurrentSong = (field: string, value: any) => {
    const newSongsData = [...songsData];
    newSongsData[currentSongIndex] = { ...newSongsData[currentSongIndex], [field]: value };
    setSongsData(newSongsData);
  };

  const toggleInstrument = (inst: string) => {
    const currentInsts = songsData[currentSongIndex]?.instruments || [];
    const newInsts = currentInsts.includes(inst) ? currentInsts.filter((i: any) => i !== inst) : [...currentInsts, inst];
    updateCurrentSong('instruments', newInsts);
  };

  const handleGoToPayment = async () => {
    setErrorMessage(null);
    if (!user) {
      setErrorMessage("Debes iniciar sesión para continuar.");
      return;
    }
    
    try {
      // Crear UN solo pedido con todas las canciones
      const newOrder = await orderService.create(user.uid, { 
        package: selectedPackage?.id === '1' ? 'single' : selectedPackage?.id === '2' ? 'duo' : 'trio',
        price: selectedPackage?.price || 30000,
        songsData: songsData.map(song => ({
          genre: song?.genre || '',
          mood: song?.mood || '',
          occasion: song?.occasion || '',
          singer: song?.singer || '',
          instruments: song?.instruments || [],
          story: song?.story || ''
        })),
        customerEmail: user.email,
        customerName: user.displayName
      });

      // Extraer solo datos JSON puros para evitar DataCloneError
      const pedidoData = {
        orderId: newOrder.id,
        packageName: selectedPackage?.name || '',
        packagePrice: selectedPackage?.price || 0,
        packageSongs: selectedPackage?.songs || 0,
        customerEmail: user?.email || '',
        customerName: user?.displayName || '',
        songsData: songsData.map(song => ({
          genre: song?.genre || '',
          mood: song?.mood || '',
          occasion: song?.occasion || '',
          singer: song?.singer || '',
          instruments: song?.instruments || [],
          story: song?.story || ''
        }))
      };

      navigate('/checkout', { state: pedidoData });

    } catch (error) {
      console.error("Error al crear el pedido:", error);
      setErrorMessage("Ocurrió un error al guardar tu solicitud. Por favor, intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-10 pb-20 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm text-center">
            {errorMessage}
          </div>
        )}
        
        {step === 1 && (
          <div className="text-center animate-in fade-in">
            <h1 className="text-3xl font-serif mb-8 italic">Plan</h1>
            <div className="bg-orange-900/20 border border-orange-900/50 py-3 rounded-xl mb-8 text-orange-400 text-sm font-bold flex items-center justify-center gap-2">
              <Zap size={14} /> Promoción por Tiempo Limitado
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {PACKAGES.map((pkg) => (
                <button key={pkg.id} onClick={() => handlePackageSelect(pkg)} className="relative bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl hover:border-emerald-500 transition-all text-center group">
                  {pkg.discount && <span className="absolute top-2 right-2 bg-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">{pkg.discount}</span>}
                  {pkg.tag && <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">{pkg.tag}</span>}
                  <div className="bg-gray-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500/20">{pkg.icon}</div>
                  <div className="text-sm text-gray-400 mb-1">{pkg.name}</div>
                  <div className="text-2xl font-bold">${pkg.price.toLocaleString('es-CL')}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-serif italic mb-2">Canción {currentSongIndex + 1} de {selectedPackage?.songs}</h1>
              <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">
                {subStep === 1 ? "Parte 1: Define el Estilo" : "Parte 2: Cuéntanos la Historia"}
              </p>
            </div>
            
            {subStep === 1 && (
              <div className="animate-in slide-in-from-left duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">Género</label>
                    <select value={songsData[currentSongIndex].genre} onChange={(e) => updateCurrentSong('genre', e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 p-3 rounded-xl text-sm outline-none focus:border-emerald-500">
                      <option value="">Selecciona...</option>
                      {GÉNEROS_OPCIONES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">Ánimo</label>
                    <select value={songsData[currentSongIndex].mood} onChange={(e) => updateCurrentSong('mood', e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 p-3 rounded-xl text-sm outline-none focus:border-emerald-500">
                      <option value="">Selecciona...</option>
                      {ÁNIMOS_OPCIONES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">Ocasión</label>
                    <select value={songsData[currentSongIndex].occasion} onChange={(e) => updateCurrentSong('occasion', e.target.value)} className="w-full bg-[#1a1a1a] border border-gray-800 p-3 rounded-xl text-sm outline-none focus:border-emerald-500">
                      <option value="">Selecciona...</option>
                      {OCASIONES_OPCIONES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">Cantante</label>
                    <div className="flex gap-2">
                      {VOCES_OPCIONES.map(v => (
                        <button key={v} onClick={() => updateCurrentSong('singer', v)} className={`flex-1 py-3 text-[10px] rounded-xl border transition-all ${songsData[currentSongIndex].singer === v ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-800 bg-[#1a1a1a]'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <label className="text-xs text-gray-500 mb-3 block uppercase tracking-wider">Instrumentos</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {INSTRUMENTOS_OPCIONES.map(inst => (
                      <button key={inst} onClick={() => toggleInstrument(inst)} className={`py-3 text-[10px] rounded-lg border transition-all ${songsData[currentSongIndex].instruments.includes(inst) ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-800 bg-[#1a1a1a] text-gray-400'}`}>
                        {inst}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-800 pt-8">
                  <button onClick={() => { if(currentSongIndex > 0) { setCurrentSongIndex(currentSongIndex - 1); setSubStep(2); } else { setStep(1); } }} className="text-gray-500 hover:text-white flex items-center gap-2 transition-all">
                    <ChevronRight size={18} className="rotate-180" /> Atrás
                  </button>
                  <button onClick={() => setSubStep(2)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-3 rounded-full font-bold flex items-center gap-2 transition-all">
                    Siguiente: Historia <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {subStep === 2 && (
              <div className="animate-in slide-in-from-right duration-300">
                <div className="mb-10">
                  <label className="text-xs text-gray-500 mb-3 block uppercase tracking-wider">Cuéntanos la historia de esta canción</label>
                  <textarea 
                    value={songsData[currentSongIndex].story}
                    onChange={(e) => updateCurrentSong('story', e.target.value)}
                    placeholder="Describe detalles, nombres, anécdotas..."
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 text-white h-64 focus:border-emerald-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex justify-between items-center border-t border-gray-800 pt-8">
                  <button onClick={() => setSubStep(1)} className="text-gray-500 hover:text-white flex items-center gap-2 transition-all">
                    <ChevronRight size={18} className="rotate-180" /> Atrás: Estilo
                  </button>
                  <button 
                    onClick={() => { 
                      if (selectedPackage && currentSongIndex < selectedPackage.songs - 1) { 
                        setCurrentSongIndex(currentSongIndex + 1); 
                        setSubStep(1);
                        window.scrollTo(0,0); 
                      } else { 
                        setStep(3); 
                      } 
                    }} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-3 rounded-full font-bold flex items-center gap-2 transition-all"
                  >
                    {selectedPackage && currentSongIndex < selectedPackage.songs - 1 ? "Siguiente Canción" : "Ir al Pago"} <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="max-w-md mx-auto bg-[#1a1a1a] border border-gray-800 rounded-3xl p-8 text-center animate-in zoom-in">
            <h2 className="text-xl font-bold mb-6">Resumen y Reserva</h2>
            <div className="flex justify-between items-center text-xl font-bold text-emerald-500 py-6 border-y border-gray-800 mb-6">
              <span className="text-xs text-gray-400 uppercase">Reserva (50%):</span>
              <span>${((selectedPackage?.price || 0) / 2).toLocaleString('es-CL')}</span>
            </div>
            <button onClick={handleGoToPayment} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all">
              Ir al Pago
            </button>
            <button onClick={() => { setStep(2); setSubStep(2); setCurrentSongIndex((selectedPackage?.songs || 1) - 1); }} className="mt-4 text-gray-500 text-sm hover:text-white transition-all">
              Volver a revisar datos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRequest;