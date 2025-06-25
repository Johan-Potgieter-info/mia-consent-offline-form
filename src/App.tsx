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
);

export default App;
