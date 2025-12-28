import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, AlertCircle, X, Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/firebase';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType | null) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const u = authService.getCurrentUser();
      if (u) {
        const destination = sessionStorage.getItem('authDestination');
        sessionStorage.removeItem('authDestination');
        
        // Primero verificar si es admin
        if (u.email === 'g.d.chile@gmail.com') {
          onLogin(u);
          navigate('/admin');
        } else if (destination === 'admin') {
          // Si no es admin pero intentó ir a admin
          await authService.logout();
          onLogin(null);
          navigate('/');
        } else {
          // Usuario normal va a create
          onLogin(u);
          navigate('/create');
        }
      }
    };
    checkUser();
  }, [onLogin, navigate]);

  const handleSocialLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const user = await authService.loginGoogle();
      onLogin(user);
      const destination = sessionStorage.getItem('authDestination');
      sessionStorage.removeItem('authDestination');
      
      if (destination === 'admin') {
        if (user.email === 'g.d.chile@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/');
          await authService.logout();
        }
      } else {
        navigate('/create');
      }
    } catch(err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error al iniciar sesión con Google.');
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Completa todos los campos.");
      return;
    }
    if (isRegistering && !name) {
      setError("Ingresa tu nombre.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let user;
      if (isRegistering) {
        user = await authService.registerWithEmail(email, password, name);
      } else {
        user = await authService.loginWithEmail(email, password);
      }
      onLogin(user);
      const destination = sessionStorage.getItem('authDestination');
      sessionStorage.removeItem('authDestination');
      
      if (destination === 'admin') {
        if (user.email === 'g.d.chile@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/');
          await authService.logout();
        }
      } else {
        navigate('/create');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Error de autenticación. Verifica tus credenciales.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-50"
      >
        <X size={24} />
      </button>
      
      <div className="absolute inset-0 bg-bgDark z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,105,92,0.5)]">
            <Music className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">
            {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
          </h2>
          <p className="text-gray-400 mt-2 text-sm">Tu historia comienza aquí.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Cargando...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs para elegir entre Ingresar y Registrarse */}
            <div className="flex bg-bgDark border border-white/10 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  !isRegistering 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  isRegistering 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Registrarse
              </button>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isRegistering && (
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full h-12 pl-12 bg-bgDark border border-white/10 rounded-xl text-white" 
                    placeholder="Tu Nombre" 
                    required={isRegistering} 
                  />
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-4 top-3 text-gray-500" size={18} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full h-12 pl-12 bg-bgDark border border-white/10 rounded-xl text-white" 
                  placeholder="correo@ejemplo.com" 
                  required 
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-3 text-gray-500" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full h-12 pl-12 pr-12 bg-bgDark border border-white/10 rounded-xl text-white" 
                  placeholder="Contraseña" 
                  required 
                  minLength={6} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-12 bg-primary hover:bg-primaryDark text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Ingresar')} 
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;