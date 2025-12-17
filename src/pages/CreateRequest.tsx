import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Mic, Upload, CheckCircle2, Wand2, PlayCircle, Loader2, Zap, Gift, Music2 } from 'lucide-react';
import { GENRES, MOODS, OCCASIONS, SINGERS, INSTRUMENTS, SongRequest, User } from '../types';
import { calculateEstimatedPrice } from '../services/mockBackend';
import { enhanceStory } from '../services/geminiService';

interface CreateRequestProps {
  user: User | null;
}

const STEPS = ['Paquete', 'Estilo', 'Historia', 'Resumen'];

const CreateRequest: React.FC<CreateRequestProps> = ({ user }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
const [formData, setFormData] = useState<any>({
    package: 'single',
    songs: [{ genre: '', mood: '', occasion: '', storyText: '', singer: '', instruments: [] }]
  });

  const getSongCount = () => {
    if (formData.package === 'trio') return 3;
    if (formData.package === 'duo') return 2;
    return 1;
  };

  useEffect(() => {
    const count = getSongCount();
    const newSongs = Array(count).fill(null).map((_, i) => 
      formData.songs[i] || { genre: '', mood: '', occasion: '', storyText: '', singer: '', instruments: [] }
    );
    setFormData(prev => ({ ...prev, songs: newSongs }));
  }, [formData.package]);
  const [otherGenre, setOtherGenre] = useState('');
  const [otherOccasion, setOtherOccasion] = useState('');
  const price = calculateEstimatedPrice(formData.genre, formData.instruments, formData.package);

  useEffect(() => { if (!user) navigate('/auth'); }, [user, navigate]);

  const handleInputChange = (field: keyof SongRequest, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  
  const toggleInstrument = (inst: string) => {
    setFormData(prev => {
        const current = prev.instruments;
        if (current.includes(inst)) return { ...prev, instruments: current.filter(i => i !== inst) };
        if (current.length >= 4) return prev; 
        return { ...prev, instruments: [...current, inst] };
    });
  };

  const handleEnhanceStory = async () => {
    if (!formData.storyText || formData.storyText.length < 20) return;
    setIsEnhancing(true);
    const actualGenre = formData.genre === 'Otro' ? otherGenre : formData.genre;
    const enhanced = await enhanceStory(formData.storyText, formData.mood, actualGenre);
    setFormData(prev => ({ ...prev, storyText: enhanced }));
    setIsEnhancing(false);
  };

  const handleGoToCheckout = () => {
    if(!user) return;
    const finalData = {
        ...formData,
        genre: formData.genre === 'Otro' ? otherGenre : formData.genre,
        occasion: formData.occasion === 'Otro' ? otherOccasion : formData.occasion
    };
    navigate('/checkout', { state: { orderData: finalData, price: price } });
  };

  const nextStep = () => {
      if (currentStep === 1) {
          if(!formData.genre || !formData.mood || !formData.occasion || !formData.singer || formData.instruments.length === 0) return alert("Completa todos los campos.");
          if (formData.genre === 'Otro' && !otherGenre.trim()) return alert("Especifica el género.");
          if (formData.occasion === 'Otro' && !otherOccasion.trim()) return alert("Especifica la ocasión.");
      }
      if (currentStep === 2 && !formData.storyText) return alert("Escribe tu historia.");
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
  };

  const prevStep = () => { setCurrentStep(prev => prev - 1); window.scrollTo(0, 0); };
  const formatMoney = (amount: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  const renderStep0 = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-8 bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-2xl border border-orange-500/30">
            <h3 className="text-accent font-bold text-lg flex items-center justify-center gap-2"><Zap size={20} className="animate-pulse" /> Promoción por Tiempo Limitado</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
            <button type="button" onClick={() => handleInputChange('package', 'single')} className={`relative p-6 rounded-2xl border-2 transition-all ${formData.package === 'single' ? 'bg-primary/20 border-primary' : 'bg-surface border-white/10'}`}>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto"><Music2 size={24} /></div>
                <h4 className="text-xl font-bold text-white text-center mb-2">1 Canción</h4>
                <div className="text-center"><span className="text-2xl font-bold text-white">$30.000</span></div>
            </button>
            <button type="button" onClick={() => handleInputChange('package', 'duo')} className={`relative p-6 rounded-2xl border-2 transition-all ${formData.package === 'duo' ? 'bg-accent/20 border-accent' : 'bg-surface border-white/10'}`}>
                <div className="absolute top-0 right-0 bg-accent text-bgDark text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">-25%</div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto"><Music2 size={20} /><Music2 size={20} /></div>
                <h4 className="text-xl font-bold text-white text-center mb-2">2 Canciones</h4>
                <div className="text-center"><span className="text-2xl font-bold text-white">$45.000</span></div>
            </button>
            <button type="button" onClick={() => handleInputChange('package', 'trio')} className={`relative p-6 rounded-2xl border-2 transition-all ${formData.package === 'trio' ? 'bg-purple-500/20 border-purple-500' : 'bg-surface border-white/10'}`}>
                 <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">¡MEJOR OFERTA!</div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto"><Gift size={24} /></div>
                <h4 className="text-xl font-bold text-white text-center mb-2">3 Canciones</h4>
                <div className="text-center"><span className="text-2xl font-bold text-white">$60.000</span></div>
            </button>
        </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Género</label><select value={formData.genre} onChange={(e) => handleInputChange('genre', e.target.value)} className="w-full h-12 bg-surface border border-white/10 rounded-xl px-4 text-white"><option value="">Selecciona...</option>{GENRES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            {formData.genre === 'Otro' && <input type="text" value={otherGenre} onChange={(e) => setOtherGenre(e.target.value)} placeholder="Especifica..." className="mt-2 w-full h-10 bg-surface border border-white/10 rounded-lg px-4 text-white" />}</div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Ánimo</label><select value={formData.mood} onChange={(e) => handleInputChange('mood', e.target.value)} className="w-full h-12 bg-surface border border-white/10 rounded-xl px-4 text-white"><option value="">Selecciona...</option>{MOODS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Ocasión</label><select value={formData.occasion} onChange={(e) => handleInputChange('occasion', e.target.value)} className="w-full h-12 bg-surface border border-white/10 rounded-xl px-4 text-white"><option value="">Selecciona...</option>{OCCASIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            {formData.occasion === 'Otro' && <input type="text" value={otherOccasion} onChange={(e) => setOtherOccasion(e.target.value)} placeholder="Especifica..." className="mt-2 w-full h-10 bg-surface border border-white/10 rounded-lg px-4 text-white" />}</div>
            <div><label className="block text-sm font-medium text-gray-300 mb-2">Cantante</label><div className="grid grid-cols-3 gap-2">{SINGERS.map((s) => (<button key={s.value} type="button" onClick={() => handleInputChange('singer', s.value)} className={`h-12 rounded-xl border text-sm font-medium ${formData.singer === s.value ? 'bg-accent text-bgDark' : 'bg-surface text-gray-400'}`}>{s.label.split(' ')[0]}</button>))}</div></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-300 mb-3">Instrumentos</label><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">{INSTRUMENTS.map((inst) => (<button key={inst.value} type="button" onClick={() => toggleInstrument(inst.value)} className={`p-3 rounded-xl border text-sm ${formData.instruments.includes(inst.value) ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-white/10 text-gray-400'}`}>{inst.label}</button>))}</div></div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-fade-in">
        <div>
            <div className="flex justify-between items-end mb-2"><label className="block text-sm font-medium text-gray-300">Tu historia</label><button type="button" onClick={handleEnhanceStory} disabled={isEnhancing || !formData.storyText} className="text-xs flex items-center gap-1 text-accent disabled:opacity-50">{isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} Mejorar con IA</button></div>
            <textarea value={formData.storyText} onChange={(e) => handleInputChange('storyText', e.target.value)} maxLength={2000} className="w-full h-64 bg-surface border border-white/10 rounded-xl p-4 text-white resize-none" placeholder="Cuéntanos..."></textarea>
        </div>
        <div className="bg-surface border border-white/10 rounded-xl p-6">
            <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2"><Mic size={18} className="text-accent" /> Audio (Opcional)</h4>
            <label className="w-full cursor-pointer h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5"><input type="file" className="hidden" accept="audio/*" onChange={(e) => handleInputChange('storyAudio', e.target.files?.[0])} /><Upload className="text-gray-500" /><span className="text-sm text-gray-500">{formData.storyAudio ? formData.storyAudio.name : "Subir audio"}</span></label>
        </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-fade-in">
        <div className="bg-surface border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
            <h3 className="text-xl font-serif font-bold mb-6 border-b border-white/10 pb-4">Resumen</h3>
            <div className="bg-bgDark rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center text-accent"><span className="text-sm font-medium">Depósito Inicial (50%)</span><span className="text-lg font-bold">{formatMoney(price / 2)}</span></div>
            </div>
            <button onClick={handleGoToCheckout} className="w-full py-4 bg-accent text-bgDark font-bold rounded-xl hover:bg-orange-400 flex items-center justify-center gap-2 shadow-lg">Continuar al Pago</button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bgDark py-12 px-4">
        <div className="container mx-auto max-w-3xl">
            <div className="flex items-center justify-between mb-12 px-2">
                {STEPS.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center relative z-10 w-16 md:w-24">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx <= currentStep ? 'bg-primary text-white' : 'bg-surface text-gray-600 border border-white/10'}`}>{idx + 1}</div>
                        <span className={`text-[10px] mt-2 ${idx <= currentStep ? 'text-white' : 'text-gray-600'}`}>{step}</span>
                    </div>
                ))}
            </div>
            <h2 className="text-3xl font-serif font-bold text-center mb-10">{currentStep === 0 && 'Plan'} {currentStep === 1 && 'Estilo'} {currentStep === 2 && 'Historia'} {currentStep === 3 && 'Pagar'}</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                {currentStep === 0 && renderStep0()}
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                <div className="mt-10 flex justify-between">
                    {currentStep > 0 && <button type="button" onClick={prevStep} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white flex items-center gap-2"><ChevronLeft size={18} /> Anterior</button>}
                    {currentStep < 3 && <button type="button" onClick={nextStep} className="ml-auto px-8 py-3 bg-primary text-white rounded-xl hover:bg-primaryDark font-bold flex items-center gap-2">Siguiente <ChevronRight size={18} /></button>}
                </div>
            </form>
        </div>
    </div>
  );
};
export default CreateRequest;
