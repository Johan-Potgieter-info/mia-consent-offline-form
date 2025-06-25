import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ConsentForm from './components/ConsentForm';
import DraftList from './components/DraftList';
import DraftEditor from './components/DraftEditor';

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<ConsentForm />} />
    <Route path="/drafts" element={<DraftList />} />
    <Route path="/edit/:id" element={<DraftEditor />} />
  </Routes>

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FormPage from "./pages/FormPage";
import DraftList from "./pages/DraftList";
import DraftEditor from "./pages/DraftEditor";
import NotFound from "./pages/NotFound";

const App: React.FC = () => (
  <Router basename="/mia-consent-offline-form">
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/consent-form" element={<FormPage />} />
      <Route path="/consent-form/:draftId" element={<FormPage />} />
      <Route path="/drafts" element={<DraftList />} />
      <Route path="/edit/:id" element={<DraftEditor />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>
);

export default App;
