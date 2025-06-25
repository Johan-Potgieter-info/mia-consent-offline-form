import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from "./components/ErrorBoundary";
import './index.css';

// Register service worker only in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const swPath = `${import.meta.env.BASE_URL}sw.js`;
  console.log("Attempting to register SW at:", swPath);
  navigator.serviceWorker
    .register(swPath)
    .then(() => console.log('✅ Service Worker registered'))
    .catch((err) => console.error('❌ Service Worker registration failed:', err));
}

// Use proper basename for GitHub Pages routing
createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename="/mia-consent-offline-form">
    <App />
  </BrowserRouter>
);

