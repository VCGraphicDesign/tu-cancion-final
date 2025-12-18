import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2, Plus, Trash2, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface CreateRequestProps {
  user: User | null;
}

const CreateRequest: React.FC<CreateRequestProps> = ({ user }) => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([{ id: 1, title: '', genre: 'Bolero' }]);

  const addSong = () => {
    if (songs.length < 3) {
      setSongs([...songs, { id: Date.now(), title: '', genre: 'Bolero' }]);
    }
  };

  const removeSong = (id: number) => {
    if (songs.length > 1) {
      setSongs(songs.filter(s => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulamos el envío y vamos al pago
    navigate('/checkout', { state: { price: songs.length * 30000 } });
  };

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Configura tus canciones</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {songs.map((song, index) => (
            <div key={song.id} className="p-6 bg-gray-900 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-orange-500 font-bold">Canción #{index + 1}</span>
                {songs.length > 1 && (
                  <button type="button" onClick={() => removeSong(song.id)} className="text-red-500">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <input 
                className="w-full bg-black border border-white/10 p-3 rounded-lg text-white mb-2"
                placeholder="¿Para quién es esta canción?"
                required
              />
            </div>
          ))}

          {songs.length < 3 && (
            <button 
              type="button" 
              onClick={addSong}
              className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Agregar otra canción (Dúo/Trío)
            </button>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-8"
          >
            Continuar al Pago <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
