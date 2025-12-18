import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Mic, Upload, Wand2, Loader2, Zap, Gift, Music2 } from 'lucide-react';

// LISTAS INTERNAS PARA GARANTIZAR QUE FUNCIONE A LA PRIMERA
const GENRES = [
  { value: 'Pop', label: 'Pop' }, { value: 'Rock', label: 'Rock' }, { value: 'Balada', label: 'Balada' },
  { value: 'Folk', label: 'Folk' }, { value: 'Urbano', label: 'Urbano' }, { value: 'Otro', label: 'Otro' }
];
const MOODS = [
  { value: 'Feliz', label: 'Feliz' }, { value: 'Melancólico', label: 'Melancólico' }, 
  { value: 'Triste', label: 'Triste' }, { value: 'Enérgico', label: 'Enérgico' }, { value: 'Romántico', label: 'Romántico' }
];
const OCCASIONS = [
  { value: 'Cumpleaños', label: 'Cumpleaños' }, { value: 'Matrimonio', label: 'Matrimonio' },
  { value: 'Aniversario', label: 'Aniversario' }, { value: 'Despedida', label: 'Despedida' }, { value: 'Otro', label: 'Otro' }
];
const SINGERS = [
  { value: 'Hombre', label: 'Voz Hombre' }, { value: 'Mujer', label: 'Voz Mujer' }, { value: 'Duo', label: 'Dúo (Ambos)' }
];
const INSTRUMENTS = [
  { value: 'Guitarra', label: 'Guitarra' }, { value: 'Piano', label: 'Piano' }, { value: 'Batería', label: 'Batería' },
  { value: 'Cuerdas', label: 'Cuerdas' }, { value: 'Sintetizador', label: 'Sintetizador' }
];

const CreateRequest: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [formData, setFormData] = useState({
    package: 'single', genre: '', mood: '', occasion: '', singer: '', instruments: [] as string[], storyText: '', storyAudio: null as File | null,
  });
  const [otherGenre, setOtherGenre] = useState('');
  const [otherOccasion, setOtherOccasion] = useState('');

  // Precios de tus promociones
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
      if(!formData.genre || !formData.mood || !formData.occasion || !formData.singer) return alert("Por favor, completa las opciones.");
    }
    if (currentStep === 2 && !formData.storyText) return alert("Escribe tu historia para continuar.");
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const formatMoney = (amount: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Indicador de Pasos */}
        <div className="flex justify-between mb-12">
          {['Plan', 'Estilo', 'Historia', 'Pagar'].map((step, idx) => (
            <div key={idx} className={`text-center ${idx <= currentStep ? 'text-orange-500' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center border ${idx <= currentStep ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700'}`}>{idx + 1}</div>
              <span className="text-xs mt-2 block">{step}</span>
            </div>
          ))}
        </div>

        {/* CONTENIDO DE LOS PASOS */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center p-4 rounded-2xl border border-orange-500/30 bg-orange-500/10">
              <h3 className="text-orange-500 font-bold flex items-center justify-center gap-2"><Zap size={20} /> Promoción por Tiempo Limitado</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <button onClick={() => handleInputChange('package', 'single')} className={`p-6 rounded-2xl border-2 transition-all ${formData.package === 'single' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10'}`}>
                <Music2 className="mx-auto mb-4" />
                <h4 className="font-bold">1 Canción</h4>
                <p className="text-xl">$30.000</p>
              </button>
              <button onClick={() => handleInputChange('package', 'duo')} className={`relative p-6 rounded-2xl border-2 transition-all ${formData.package === 'duo' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10'}`}>
                <div className="absolute top-0 right-0 bg-orange-500 text-black text-[10px] font-bold px-2 py-1">-25%</div>
                <div className="flex justify-center mb-4"><Music2 size={20}/><Music2 size={20}/></div>
                <h4 className="font-bold">2 Canciones</h4>
                <p className="text-xl">$45.000</p>
              </button>
              <button onClick={() => handleInputChange('package', 'trio')} className={`relative p-6 rounded-2xl border-2 transition-all ${formData.package === 'trio' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10'}`}>
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-2 py-1">3x2</div>
                <Gift className="mx-auto mb-4" />
                <h4 className="font-bold">3 Canciones</h4>
                <p className="text-xl">$60.000</p>
              </button>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2 text-gray-400">Género Musical</label>
                <select value={formData.genre} onChange={(e) => handleInputChange('genre', e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl p-3">
                  <option value="">Selecciona...</option>
                  {GENRES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-400">Estado de Ánimo</label>
                <select value={formData.mood} onChange={(e) => handleInputChange('mood', e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl p-3">
                  <option value="">Selecciona...</option>
                  {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-400">Ocasión Especial</label>
                <select value={formData.occasion} onChange={(e) => handleInputChange('occasion', e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl p-3">
                  <option value="">Selecciona...</option>
                  {OCCASIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-400">Tipo de Voz</label>
                <div className="grid grid-cols-3 gap-2">
                  {SINGERS.map(s => (
                    <button key={s.value} onClick={() => handleInputChange('singer', s.value)} className={`p-2 text-xs rounded-lg border ${formData.singer === s.value ? 'bg-orange-500 border-orange-500' : 'border-white/10'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-3 text-gray-400">Instrumentos Sugeridos</label>
              <div className="flex flex-wrap gap-2">
                {INSTRUMENTS.map(inst => (
                  <button key={inst.value} onClick={() => toggleInstrument(inst.value)} className={`px-4 py-2 rounded-full border text-sm ${formData.instruments.includes(inst.value) ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'border-white/10'}`}>
                    {inst.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <label className="block text-sm text-gray-400">Tu historia y detalles para la letra</label>
            <textarea value={formData.storyText} onChange={(e) => handleInputChange('storyText', e.target.value)} className="w-full h-64 bg-gray-900 border border-white/10 rounded-2xl p-4 resize-none" placeholder="Cuéntanos sobre la persona, anécdotas o sentimientos..." />
            <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl text-center">
              <Upload className="mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-500">Subir audio de referencia (Opcional)</p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-gray-900 p-8 rounded-3xl border border-white/10 text-center">
            <h3 className="text-2xl font-bold mb-4">Resumen de tu Pedido</h3>
            <p className="text-gray-400 mb-6">Paquete: {formData.package === 'single' ? '1 Canción' : formData.package === 'duo' ? '2 Canciones' : '3 Canciones'}</p>
            <div className="text-3xl font-bold text-orange-500 mb-8">{formatMoney(currentPrice)}</div>
            <button onClick={() => navigate('/checkout')} className="w-full py-4 bg-orange-500 text-black font-bold rounded-xl">Ir a Pagar</button>
          </div>
        )}

        {/* Navegación */}
        <div className="mt-10 flex justify-between">
          {currentStep > 0 && <button onClick={() => setCurrentStep(currentStep - 1)} className="px-6 py-3 border border-white/10 rounded-xl flex items-center gap-2"><ChevronLeft size={18}/> Anterior</button>}
          {currentStep < 3 && <button onClick={nextStep} className="ml-auto px-8 py-3 bg-orange-500 text-black font-bold rounded-xl flex items-center gap-2">Siguiente <ChevronRight size={18}/></button>}
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
