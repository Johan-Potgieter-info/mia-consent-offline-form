import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

<<<<<<< HEAD
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
=======
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Only register service worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const swPath = `${import.meta.env.BASE_URL}sw.js`;
  console.log("Attempting to register SW at:", swPath);
  navigator.serviceWorker
    .register(swPath)
    .then(() => console.log('✅ SW registered'))
    .catch(err => console.error('❌ SW registration failed:', err));
}

createRoot(document.getElementById("root")!).render(<App />);
>>>>>>> a8cb6c8a367c1e95b8f75ed354c5492789feddab
