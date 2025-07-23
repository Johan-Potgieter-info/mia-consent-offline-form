
import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import SafeAppWrapper from './components/SafeAppWrapper';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <SafeAppWrapper>
      <App />
    </SafeAppWrapper>
  );
  console.log('✅ App rendered successfully with error boundary');
} else {
  console.error('❌ Root container not found');
}
