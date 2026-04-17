// =============================================================================
// src/components/Layout.jsx — App Shell (Sidebar + Main Content)
// =============================================================================
// This component wraps every page and provides:
//   1. The sidebar with CIHE logo and navigation links
//   2. The main content area where each page renders
//
// Navigation (Week 1 — simplified):
//   Detector → main analysis page
//   History  → past predictions
//
// NavLink from React Router automatically adds an "active" style
// to the link that matches the current URL.
// =============================================================================

import { NavLink } from 'react-router-dom'
import { Shield, Clock } from 'lucide-react'

// Navigation items — add more here in future weeks
const NAV = [
  { to: '/',        icon: Shield, label: 'Detector' },
  { to: '/history', icon: Clock,  label: 'History'  },
]

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ================================================================
          SIDEBAR — Fixed left panel with logo and navigation
          ================================================================ */}
      <aside style={{
        position: 'fixed', top: 0, left: 0,
        height: '100%', width: 200,
        background: '#111827',
        borderRight: '1px solid #1e2d45',
        display: 'flex', flexDirection: 'column',
        zIndex: 50,
      }}>

        {/* ── Logo Section ── */}
        {/* Shows CIHE logo image + app name */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #1e2d45',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {/* CIHE logo — stored in frontend/public/cihe-logo.png */}
          <img
            src="/cihe-logo.png"
            alt="CIHE Logo"
            style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{
              fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700,
              color: '#e8f4fd', letterSpacing: '0.08em',
            }}>
              PHISHGUARD
            </div>
            <div style={{ fontSize: 10, color: '#6b7a99', marginTop: 2 }}>
              AI Threat Detector
            </div>
          </div>
        </div>

        {/* ── Navigation Links ── */}
        <nav style={{
          flex: 1, padding: '12px 8px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}   // "end" ensures "/" only matches exact path
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10,
                textDecoration: 'none', fontSize: 13, fontWeight: 500,
                transition: 'all 0.15s',
                // Active link gets highlighted in signal blue
                background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                border:     isActive ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                color:      isActive ? '#00d4ff' : '#6b7a99',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} color={isActive ? '#00d4ff' : '#6b7a99'} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ================================================================
          MAIN CONTENT AREA — scrollable page content
          ================================================================ */}
      <main style={{
        flex: 1,
        marginLeft: 200,      // Offset by sidebar width
        minHeight: '100vh',
        background: '#0a0e1a',
      }}>
        {/* Page content is constrained to max 960px and padded */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 32px' }}>
          {children}
        </div>
      </main>

    </div>
  )
}
