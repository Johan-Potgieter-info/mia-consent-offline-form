console.log('🧪 minimal root render');
import React from 'react';
import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
if (container) createRoot(container).render(<div style={{ padding: 20 }}>✅ Rendered safely</div>);
