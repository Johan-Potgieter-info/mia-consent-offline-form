import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/mia-consent-offline-form/sw.js')
    .then(() => console.log('✅ [DEBUG] Service Worker registered'))
    .catch((err) => console.error('❌ [DEBUG] Service Worker registration failed:', err));
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename="/mia-consent-offline-form">
    <App />
  </BrowserRouter>
);
