// =============================================================================
// src/App.jsx — Root Application Component
// =============================================================================
// Defines the page routes for the application.
// Each route maps a URL path to a page component.
//
// Week 1 includes only 2 pages:
//   /         → Detector page (main email analysis page)
//   /history  → History page (view past predictions)
//
// All pages are wrapped in the Layout component which provides
// the sidebar navigation and CIHE logo.
// =============================================================================

import { Routes, Route } from 'react-router-dom'
import Layout       from './components/Layout'
import DetectorPage from './pages/DetectorPage'
import HistoryPage  from './pages/HistoryPage'

export default function App() {
  return (
    // Layout wraps all pages — provides sidebar + main content area
    <Layout>
      <Routes>
        {/* Main detector page — accessible at http://localhost:5173 */}
        <Route path="/"        element={<DetectorPage />} />

        {/* History page — accessible at http://localhost:5173/history */}
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Layout>
  )
}
