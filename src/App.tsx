
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "./components/ui/toaster";
import SafeAppWrapper from './components/SafeAppWrapper';
import Index from './pages/Index';
import ConsentForm from './components/ConsentForm';

const App: React.FC = () => {
  console.log('App: Rendering main App component');
  
  try {
    return (
      <SafeAppWrapper>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/consent-form" element={<ConsentForm />} />
          <Route path="/consent-form/:draftId" element={<ConsentForm />} />
        </Routes>
        <Toaster />
      </SafeAppWrapper>
    );
  } catch (error) {
    console.error('App: Critical error in App component:', error);
    return (
      <div style={{ 
        padding: '24px', 
        fontFamily: 'Arial, sans-serif', 
        color: '#990000',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2>🚨 Application Error</h2>
        <p>The application encountered a critical error.</p>
        <p><strong>Error:</strong> {String(error)}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#ef4805', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }
};

export default App;
