import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn } from 'lucide-react';
import { authService } from '../services/firebase';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Verificamos si es tu correo autorizado
    if (email.trim().toLowerCase() === 'admin@tucancion.app') {
      // Si el correo es correcto, simulamos el éxito del login para entrar al panel
      navigate('/admin');
    } else {
      alert("Acceso denegado: Solo personal autorizado.");
    }
  };

  return (
    <div className="min-h-screen bg-bgDark flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-surface border border-white/10 p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/20">
            <Lock className="text-accent" size={32} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-white">Portal de Producción</h2>
          <p className="text-gray-400 mt-2">Acceso exclusivo para administración</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 ml-1 font-bold">Email Profesional</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bgDark border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent outline-none transition-all shadow-inner"
                placeholder="admin@tucancion.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 ml-1 font-bold">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bgDark border border-white/10 rounded-xl py-3 px-4 text-white focus:border-accent outline-none transition-all shadow-inner"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full bg-accent hover:bg-accent/90 text-bgDark font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg mt-4">
            <LogIn size={20} /> Entrar al Panel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;