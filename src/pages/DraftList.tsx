import React from "react";
import { Link } from "react-router-dom";

const DraftList: React.FC = () => {
  const drafts = JSON.parse(localStorage.getItem("drafts") || "[]");

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Resume Drafts</h2>
      {drafts.length === 0 ? (
        <p>No drafts available</p>
      ) : (
        <ul className="list-disc pl-5">
          {drafts.map((draft: { id: string; data: any }) => (
            <li key={draft.id}>
              <Link to={`/edit/${draft.id}`} className="text-blue-600 underline">
                Draft {draft.id}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DraftList;
