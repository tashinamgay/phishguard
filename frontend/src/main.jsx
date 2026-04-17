// =============================================================================
// src/main.jsx — React Application Bootstrap
// =============================================================================
// This is the entry point for the React application.
// It renders the root <App> component into the #root div in index.html.
//
// BrowserRouter enables client-side routing (page navigation without
// full page reloads) using React Router DOM.
// =============================================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

// Mount the React app into the <div id="root"> in index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode helps catch bugs during development (runs effects twice in dev)
  <React.StrictMode>
    {/* BrowserRouter enables URL-based navigation between pages */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
