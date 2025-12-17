import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Examples from './pages/Examples';
import Auth from './pages/Auth';
import CreateRequest from './pages/CreateRequest';
import Dashboard from './pages/Dashboard';
import PaymentGateway from './pages/PaymentGateway';
import Admin from './pages/Admin';
import Legal from './pages/Legal';
import { User } from './types';
import { authService } from './services/mockBackend';

console.log('App.tsx iniciado con MockBackend');

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
        const u = authService.getCurrentUser();
        setUser(u);
        setLoading(false);
    };
    checkUser();

    const unsubscribe = authService.onAuthStateChanged((u) => {
        setUser(u);
    });
    return () => unsubscribe && unsubscribe(); // Safety check
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">Cargando...</div>;

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/examples" element={<Examples />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth onLogin={handleLogin} />} />
          <Route path="/create" element={<CreateRequest user={user} />} />
          <Route path="/checkout" element={<PaymentGateway user={user} />} />
          <Route path="/pay/:orderId" element={<PaymentGateway user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;