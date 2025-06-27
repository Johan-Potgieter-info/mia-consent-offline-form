
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

console.log('main.tsx: Starting application initialization');

// Browser API guards
const isBrowser = typeof window !== 'undefined';
const hasNavigator = typeof navigator !== 'undefined';
const hasLocalStorage = typeof localStorage !== 'undefined';

// Register service worker only in production and browser environment
if (isBrowser && hasNavigator && 'serviceWorker' in navigator && import.meta.env.PROD) {
  const swPath = `${import.meta.env.BASE_URL}sw.js`;
  console.log("Attempting to register SW at:", swPath);
  navigator.serviceWorker
    .register(swPath)
    .then(() => console.log('✅ Service Worker registered'))
    .catch((err) => console.error('❌ Service Worker registration failed:', err));
}

// Use environment-aware basename
const getBasename = () => {
  if (!isBrowser) return undefined;
  const baseUrl = import.meta.env.BASE_URL;
  console.log('main.tsx: BASE_URL =', baseUrl);
  if (baseUrl === '/') return undefined;
  return baseUrl.replace(/^\//, '').replace(/\/$/, '');
};

const basename = getBasename();
console.log('main.tsx: Using basename =', basename);

// Add error handling for the root element
const rootElement = isBrowser ? document.getElementById('root') : null;
if (!rootElement && isBrowser) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

console.log('main.tsx: Root element found, creating React root');

// Add global error handlers only in browser
if (isBrowser) {
  window.addEventListener('error', (event) => {
    console.error('❌ Global error caught:', event.error);
    console.error('Error details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
  });
}

// Only render in browser environment
if (isBrowser && rootElement) {
  try {
    const root = createRoot(rootElement);
    console.log('main.tsx: React root created, rendering app');
    
    root.render(
      <React.StrictMode>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
    
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ Failed to render app:', error);
    // Fallback rendering
    rootElement.innerHTML = `
      <div style="padding: 24px; font-family: Arial, sans-serif; color: #990000;">
        <h2>🚨 Application Failed to Load</h2>
        <p>There was an error initializing the application.</p>
        <p><strong>Error:</strong> ${error}</p>
        <p><strong>Please check the console for more details.</strong></p>
        <button onclick="window.location.reload()" style="padding: 8px 16px; background: #ef4805; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
}
