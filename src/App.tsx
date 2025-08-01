import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import ConsentPage from './pages/ConsentPage';
import FormPage from './pages/FormPage';
import DraftList from './pages/DraftList';
import DraftEditor from './pages/DraftEditor';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <Router basename="/mia-consent-offline-form">
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
