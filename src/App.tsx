
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "./components/ui/toaster";
import SafeAppWrapper from './components/SafeAppWrapper';
import Index from './pages/Index';
import ConsentForm from './components/ConsentForm';

const App: React.FC = () => {
  console.log('App: Rendering main App component');
  
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
};

export default App;
