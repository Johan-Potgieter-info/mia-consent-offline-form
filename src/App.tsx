
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import Index from './pages/Index';
import ConsentForm from './components/ConsentForm';

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/consent-form" element={<ConsentForm />} />
        <Route path="/consent-form/:draftId" element={<ConsentForm />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
