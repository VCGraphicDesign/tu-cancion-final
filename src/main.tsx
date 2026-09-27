import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log("Tu Canción App Started - " + new Date().toLocaleTimeString());

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log("Estilos cargados");

// Registro del Service Worker para soporte PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registrado exitosamente en ámbito:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Error o aviso al registrar Service Worker:', err);
      });
  });
}
