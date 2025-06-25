import React from "react";

const App: React.FC = () => {
  console.log("🧪 Simple render test working");

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>✅ App Rendered</h1>
      <p>If you see this, the error is inside one of the routes.</p>
    </div>
  );
};

export default App;
