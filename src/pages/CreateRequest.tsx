import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2, Send, Sparkles } from 'lucide-react';

const CreateRequest: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    genre: 'Pop',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulamos que se guarda el pedido y vamos al pago
    console.log("Pedido creado:", formData);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Crea tu Historia</h1>
              <p className="text-gray-400">Cuéntanos qué quieres transmitir</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">¿A quién va dirigida o qué título tiene?</label>
              <input
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
                placeholder="Ej: Para mi hija Martina / Amor eterno"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Cuéntanos tu historia (anécdotas, sentimientos, detalles)</label>
              <textarea
                required
                rows={5}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors resize-none"
                placeholder="Escribe aquí los detalles que quieres que incluyamos en la letra..."
                value={formData.story}
                onChange={(e) => setFormData({...formData, story: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Género Musical</label>
              <select 
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
                value={formData.genre}
                onChange={(e) => setFormData({...formData, genre: e.target.value})}
              >
                <option>Pop</option>
                <option>Balada</option>
                <option>Rock</option>
                <option>Acústico</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-primary hover:bg-primaryDark text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              Continuar al Pago <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
