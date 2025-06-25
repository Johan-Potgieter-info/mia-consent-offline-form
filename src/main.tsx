
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

// Use environment-aware basename - remove leading slash and trailing slash for consistency
const getBasename = () => {
  const baseUrl = import.meta.env.BASE_URL;
  if (baseUrl === '/') return undefined; // Don't use basename in development
  return baseUrl.replace(/^\//, '').replace(/\/$/, ''); // Remove leading and trailing slashes
};

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={getBasename()}>
    <ErrorBoundary><App /></ErrorBoundary>
  </BrowserRouter>
);
