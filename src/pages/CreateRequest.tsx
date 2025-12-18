import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Mic, Upload, Wand2, Loader2, Zap, Gift, Music2 } from 'lucide-react';

// --- TUS LISTAS COMPLETAS ORIGINALES ---
const GENRES = [
  { value: 'Pop', label: 'Pop' }, { value: 'Rock', label: 'Rock' }, { value: 'Balada', label: 'Balada' },
  { value: 'Folk', label: 'Folk' }, { value: 'Urbano', label: 'Urbano' }, { value: 'Cumbia', label: 'Cumbia' },
  { value: 'Bolero', label: 'Bolero' }, { value: 'Jazz', label: 'Jazz' }, { value: 'Blues', label: 'Blues' },
  { value: 'Reggae', label: 'Reggae' }, { value: 'Tango', label: 'Tango' }, { value: 'Otro', label: 'Otro' }
];
const MOODS = [
  { value: 'Feliz', label: 'Feliz' }, { value: 'Melancólico', label: 'Melancólico' }, 
  { value: 'Triste', label: 'Triste' }, { value: 'Enérgico', label: 'Enérgico' }, 
  { value: 'Romántico', label: 'Romántico' }, { value: 'Relajado', label: 'Relajado' }
];
const OCCASIONS = [
  { value: 'Cumpleaños', label: 'Cumpleaños' }, { value: 'Matrimonio', label: 'Matrimonio' },
  { value: 'Aniversario', label: 'Aniversario' }, { value: 'Despedida', label: 'Despedida' }, 
  { value: 'Nacimiento', label: 'Nacimiento' }, { value: 'Graduación', label: 'Graduación' }, { value: 'Otro', label: 'Otro' }
];
const SINGERS = [
  { value: 'Hombre', label: 'Voz Hombre' }, { value: 'Mujer', label: 'Voz Mujer' }, { value: 'Duo', label: 'Dúo (Hombre y Mujer)' }
];
const INSTRUMENTS = [
  { value: 'Guitarra Acústica', label: 'Guitarra Acústica' }, { value: 'Guitarra Eléctrica', label: 'Guitarra Eléctrica' },
  { value: 'Piano', label: 'Piano' }, { value: 'Batería', label: 'Batería' }, { value: 'Bajo', label: 'Bajo' },
  { value: 'Violín', label: 'Violín' }, { value: 'Cello', label: 'Cello' }, { value: 'Sintetizador', label: 'Sintetizador' },
  { value: 'Saxofón', label: 'Saxofón' }, { value: 'Trompeta', label: 'Trompeta' }, { value: 'Percusión Latina', label: 'Percusión Latina' }
];

const CreateRequest: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    package: 'single', genre: '', mood: '', occasion: '', singer: '', instruments: [] as string[], storyText: '', storyAudio: null as File | null,
  });
  const [otherGenre, setOtherGenre] = useState('');
  const [otherOccasion, setOtherOccasion] = useState('');

  // Lógica de precios de tus promociones
  const prices = { single: 30000, duo: 45000, trio: 60000 };
  const currentPrice = prices[formData.package as keyof typeof prices];

  useEffect(() => { if (!user) navigate('/auth'); }, [user, navigate]);

  const handleInputChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  
  const toggleInstrument = (inst: string) => {
    setFormData(prev => {
      const current = prev.instruments;
      if (current.includes(inst)) return { ...prev, instruments: current.filter(i => i !== inst) };
      return { ...prev, instruments: [...current, inst] };
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if(!formData.genre || !formData.mood || !formData.occasion || !formData.singer || formData.instruments.length === 0) {
        return alert("Por favor, completa todas las opciones y selecciona al menos un instrumento.");
      }
    }
    if (currentStep === 2 && !formData.storyText) return alert("Escribe tu historia para continuar.");
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const formatMoney = (amount: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Pasos */}
        <div className="flex justify-between mb-12">
          {['Paquete', 'Estilo', 'Historia', 'Resumen'].map((step, idx) => (
            <div key={idx} className={`text-center flex-1 ${idx <= currentStep ? 'text-orange-500' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center border font-bold ${idx <= currentStep ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700'}`}>{idx + 1}</div>
              <span className="text-[10px] md:text-xs mt-2 block uppercase font-bold">{step}</span>
            </div>
          ))}
        </div>

        {/* Paso 0: Paquetes */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center p-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 mb-8">
              <h3 className="text-orange-500 font-bold flex items-center justify-center gap-2"><Zap size={20} className="animate-pulse" /> Promoción por Tiempo Limitado</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <button onClick={() => handleInputChange('package', 'single')} className={`p-6 rounded-2xl border-2 transition-all ${formData.package === 'single' ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(243,156,18,0.2)]' : 'border-white/10 hover:border-white/20'}`}>
                <Music2 className="mx-auto mb-4" size={32} />
                <h4 className="font-bold text-lg">1 Canción</h4>
                <p className="text-2xl font-bold mt-2">$30.000</p>
              </button>
              <button onClick={() => handleInputChange('package', 'duo')} className={`relative p-6 rounded-2xl border-2 transition-all ${formData.package === 'duo' ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(243,156,18,0.2)]' : 'border-white/10 hover:border-white/20'}`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">2ª al 50%</div>
                <div className="flex justify-center mb-4"><Music2 size={24}/><Music2 size={24}/></div>
                <h4 className="font-bold text-lg">2 Canciones</h4>
                <p className="text-2xl font-bold mt-2">$45.000</p>
              </button>
              <button onClick={() => handleInputChange('package', 'trio')} className={`relative p-6 rounded-2xl border-2 transition-all ${formData.package === 'trio' ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-white/10 hover:border-white/20'}`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">3x2 (1 Gratis)</div>
                <Gift className="mx-auto mb-4" size={32} />
                <h4 className="font-bold text-lg">3 Canciones</h4>
                <p className="text-2xl font-bold mt-2">$60.000</p>
              </button>
            </div>
          </div>
        )}

        {/* Paso 1: Selección de opciones independientes */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-wider">¿Qué género buscas?</label>
                <select value={formData.genre} onChange={(e) => handleInputChange('genre', e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl p-4 focus:border-orange-500 outline-none">
                  <option value="">Seleccionar género...</option>
                  {GENRES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
                {formData.genre === 'Otro' && <input type="text" placeholder="¿Cuál?" className="mt-2 w-full bg-gray-900 border border-white/10 rounded-xl p-3" onChange={(e) => setOtherGenre(e.target.value)} />}
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-wider">Estado de Ánimo</label>
                <select value={formData.mood} onChange={(e) => handleInputChange('mood', e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl p-4 focus:border-orange-500 outline-none">
                  <option value="">Seleccionar ánimo...</option>
                  {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-wider">Ocasión</label>
                <select value={formData.occasion} onChange={(e) => handleInputChange('occasion', e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl p-4 focus:border-orange-500 outline-none">
                  <option value="">Seleccionar ocasión...</option>
                  {OCCASIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-wider">Tipo de Voz</label>
                <div className="grid grid-cols-1 gap-2">
                  {SINGERS.map(s => (
                    <button key={s.value} onClick={() => handleInputChange('singer', s.value)} className={`p-3 text-sm rounded-xl border transition-all ${formData.singer === s.value ? 'bg-orange-500 border-orange-500 text-black font-bold' : 'border-white/10 hover:border-white/30 text-gray-400'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-4 text-gray-400 uppercase tracking-wider">Instrumentos (Selecciona los que quieras)</label>
              <div className="flex flex-wrap gap-2">
                {INSTRUMENTS.map(inst => (
                  <button key={inst.value} onClick={() => toggleInstrument(inst.value)} className={`px-4 py-2 rounded-full border text-sm transition-all ${formData.instruments.includes(inst.value) ? 'bg-orange-500/20 border-orange-500 text-orange-500 font-bold' : 'border-white/10 text-gray-400'}`}>
                    {inst.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Historia */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider">Cuéntanos tu historia detalladamente</label>
              <button className="text-orange-500 text-xs flex items-center gap-1 font-bold"><Wand2 size={14}/> Mejorar con IA</button>
            </div>
            <textarea value={formData.storyText} onChange={(e) => handleInputChange('storyText', e.target.value)} className="w-full h-72 bg-gray-900 border border-white/10 rounded-2xl p-6 resize-none focus:border-orange-500 outline-none shadow-inner" placeholder="Escribe aquí anécdotas, nombres, sentimientos o detalles que quieras en la letra..." />
            <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center bg-gray-900/50">
              <Upload className="mx-auto mb-2 text-gray-600" size={32} />
              <p className="text-sm font-bold text-gray-400">Subir audio de referencia (Opcional)</p>
              <p className="text-[10px] text-gray-600 mt-1">Puedes tararear o contar la historia en voz alta</p>
            </div>
          </div>
        )}

        {/* Paso 3: Resumen */}
        {currentStep === 3 && (
          <div className="bg-gray-900 p-8 rounded-3xl border border-white/10 shadow-2xl animate-fade-in">
            <h3 className="text-2xl font-bold mb-8 text-center border-b border-white/10 pb-4">Confirmación de Pedido</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400"><span className="text-sm">Paquete seleccionado:</span><span className="text-white font-bold">{formData.package === 'single' ? '1 Canción' : formData.package === 'duo' ? '2 Canciones' : '3 Canciones'}</span></div>
              <div className="flex justify-between text-gray-400"><span className="text-sm">Voz:</span><span className="text-white font-bold">{formData.singer}</span></div>
              <div className="flex justify-between text-gray-400"><span className="text-sm">Género:</span><span className="text-white font-bold">{formData.genre}</span></div>
              <div className="flex justify-between text-gray-400"><span className="text-sm">Depósito Inicial (50%):</span><span className="text-orange-500 font-bold">{formatMoney(currentPrice / 2)}</span></div>
            </div>
            <div className="bg-orange-500/10 p-6 rounded-2xl border border-orange-500/30 text-center mb-8">
              <p className="text-sm text-orange-500 mb-1 font-bold">Total a pagar:</p>
              <div className="text-4xl font-black text-orange-500">{formatMoney(currentPrice)}</div>
            </div>
            <button onClick={() => navigate('/checkout')} className="w-full py-4 bg-orange-500 text-black font-black text-lg rounded-2xl hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20">IR AL PAGO SEGURO</button>
          </div>
        )}

        {/* Navegación Inferior */}
        <div className="mt-12 flex justify-between">
          {currentStep > 0 && <button onClick={() => setCurrentStep(currentStep - 1)} className="px-8 py-3 border border-white/10 rounded-2xl flex items-center gap-2 font-bold hover:bg-white/5 transition-all"><ChevronLeft size={20}/> Volver</button>}
          {currentStep < 3 && <button onClick={nextStep} className="ml-auto px-10 py-3 bg-orange-500 text-black font-black rounded-2xl flex items-center gap-2 hover:bg-orange-400 transition-all shadow-lg">CONTINUAR <ChevronRight size={20}/></button>}
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
