import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const DraftEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    const foundDraft = drafts.find((d: { id: string }) => d.id === id);
    setDraft(foundDraft?.data || null);
    console.log('🔍 [DEBUG] Loaded draft:', foundDraft);
  }, [id]);

  if (!draft) return <p>Draft not found</p>;

  const handleSave = () => {
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    const updatedDrafts = drafts.map((d: { id: string; data: any }) =>
      d.id === id ? { id, data: draft } : d
    );
    localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
    alert('Draft saved!');
    console.log('🔍 [DEBUG] Saved draft:', draft);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Edit Draft {id}</h2>
      <textarea
        value={JSON.stringify(draft, null, 2)}
        onChange={(e) => {
          try {
            setDraft(JSON.parse(e.target.value));
          } catch (err) {
            console.error('🔍 [DEBUG] Invalid JSON:', err);
          }
        }}
        className="w-full h-64 p-2 border rounded"
      />
      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Save Draft
      </button>
    </div>
  );
};

export default DraftEditor;
