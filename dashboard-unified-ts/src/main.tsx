// Main entry point

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// All API calls go through the secure backend proxy
// Frontend doesn't need any Airtable configuration - backend handles everything
declare global {
  interface Window {
    USE_BACKEND_API?: boolean;
  }
}

window.USE_BACKEND_API = true; // Always use backend API proxy

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
