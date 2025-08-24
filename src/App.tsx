import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import ConsentPage from './pages/ConsentPage';
import FormPage from './pages/FormPage';
import DraftList from './pages/DraftList';
import DraftEditor from './pages/DraftEditor';
import NotFound from './pages/NotFound';

// Detect if running in Capacitor (mobile app)
const isCapacitor = window.location.protocol === 'app:' || 
                    window.location.hostname === 'localhost' && window.location.port === '';

const App: React.FC = () => {
  // Use empty basename for Capacitor, web deployment basename for browser
  const basename = isCapacitor ? "/" : "/mia-consent-offline-form";
  
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/consent-form" element={<ConsentPage />} />
        <Route path="/consent-form/:draftId" element={<ConsentPage />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/drafts" element={<DraftList />} />
        <Route path="/drafts/:id" element={<DraftEditor />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
