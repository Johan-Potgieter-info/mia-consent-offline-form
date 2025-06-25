import React from "react";
import { Routes, Route } from "react-router-dom";
import FormPage from "./pages/FormPage";
import DraftList from "./pages/DraftList";
import DraftEditor from "./pages/DraftEditor";

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<FormPage />} />
    <Route path="/drafts" element={<DraftList />} />
    <Route path="/edit/:id" element={<DraftEditor />} />
  </Routes>
);

export default App;
