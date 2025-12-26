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
import { authService } from './services/firebase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((u) => {
        setUser(u);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-orange-500">Cargando...</div>;

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/examples" element={<Examples />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth onLogin={handleLogin} />} />
          <Route path="/create" element={user ? <CreateRequest user={user} /> : <Navigate to="/auth" />} />
          <Route path="/checkout" element={<PaymentGateway user={user} />} />
          <Route path="/pay/:orderId" element={<PaymentGateway user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/admin" element={user?.email === 'g.d.chile@gmail.com' ? <Admin user={user} /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;