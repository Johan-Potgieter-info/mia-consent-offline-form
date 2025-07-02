import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConsentPage from './pages/ConsentPage';
import FormPage from './pages/FormPage';
import DraftList from './pages/DraftList';
import DraftEditor from './pages/DraftEditor';

const App: React.FC = () => {
  return (
    <Router basename="/mia-consent-offline-form">
      <Routes>
        <Route path="/" element={<ConsentPage />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/drafts" element={<DraftList />} />
        <Route path="/drafts/:id" element={<DraftEditor />} />
      </Routes>
    </Router>
  );
};

export default App;
