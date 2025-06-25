
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
