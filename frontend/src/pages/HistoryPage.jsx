// =============================================================================
// src/pages/HistoryPage.jsx — Prediction History Page
// =============================================================================
// Displays a list of all email analyses made during the current session.
// Route: /history
//
// Features:
//   - Auto-loads history when page opens
//   - Refresh button to reload latest entries
//   - Clear All button to delete all history
//   - Each row shows: email preview, model used, label, confidence, time
//   - Phishing rows are highlighted in a faint red
//
// Data source:
//   GET /api/history — fetches from backend in-memory store
//   History resets when the backend server restarts
// =============================================================================

import { useEffect, useState } from 'react'
import { getHistory, clearHistory } from '../utils/api'

// Model badge colours — matches ModelSelector colours
const MODEL_COLORS = {
  bert:       '#00d4ff',   // signal blue
  distilbert: '#00e5a0',   // green
  llama:      '#a78bfa',   // purple
}

export default function HistoryPage() {
  const [history, setHistory] = useState([])   // Array of HistoryItem objects
  const [loading, setLoading] = useState(true) // True while fetching from backend
  const [error,   setError]   = useState(null) // Error message if fetch fails

  // --------------------------------------------------------------------------
  // fetchHistory — load history from backend
  // --------------------------------------------------------------------------
  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getHistory(50)   // Get latest 50 predictions
      setHistory(Array.isArray(data) ? data : [])
    } catch {
      setError('Could not load history. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch history when the page first loads
  useEffect(() => { fetchHistory() }, [])

  // --------------------------------------------------------------------------
  // handleClear — delete all history after confirmation
  // --------------------------------------------------------------------------
  const handleClear = async () => {
    if (!window.confirm('Clear all prediction history?')) return
    await clearHistory()
    setHistory([])
  }

  // --------------------------------------------------------------------------
  // formatTime — convert UTC timestamp to readable local time
  // --------------------------------------------------------------------------
  const formatTime = (ts) => {
    try {
      // Backend returns UTC time — append 'Z' to ensure correct parsing
      return new Date(ts + 'Z').toLocaleString(undefined, {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  return (
    <div>
      {/* ── Page Header + Action Buttons ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 28,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Space Mono', fontSize: 18,
            fontWeight: 700, color: '#e8f4fd', margin: 0,
          }}>
            Prediction History
          </h1>
          <p style={{ fontSize: 13, color: '#6b7a99', marginTop: 5 }}>
            All recent email analyses — newest first
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Refresh button — reloads history from backend */}
          <button onClick={fetchHistory}
            style={{
              padding: '7px 14px', borderRadius: 10,
              border: '1px solid #1e2d45', background: 'transparent',
              color: '#6b7a99', cursor: 'pointer',
              fontFamily: 'Space Mono', fontSize: 10, letterSpacing: '0.06em',
            }}>
            ↻ Refresh
          </button>

          {/* Clear All button — only shown when there is history */}
          {history.length > 0 && (
            <button onClick={handleClear}
              style={{
                padding: '7px 14px', borderRadius: 10,
                border: '1px solid rgba(255,59,92,0.3)', background: 'transparent',
                color: '#ff3b5c', cursor: 'pointer',
                fontFamily: 'Space Mono', fontSize: 10, letterSpacing: '0.06em',
              }}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* ── Error Message ── */}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 12, marginBottom: 16, fontSize: 13,
          background: 'rgba(255,59,92,0.05)',
          border: '1px solid rgba(255,59,92,0.2)',
          color: '#ff3b5c',
        }}>
          {error}
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {/* Show placeholder rows while data is loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              height: 54, borderRadius: 12,
              background: '#161d2e', border: '1px solid #1e2d45', opacity: 0.5,
            }} />
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {/* Shown when loaded but no history exists yet */}
      {!loading && history.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '72px 0', gap: 12,
          border: '1px solid #1e2d45', borderRadius: 16, background: '#111827',
        }}>
          <div style={{ fontSize: 28 }}>🕐</div>
          <div style={{
            fontFamily: 'Space Mono', fontSize: 11, color: '#6b7a99',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            No history yet
          </div>
          <div style={{ fontSize: 12, color: '#4a5568' }}>
            Analyse some emails to see them here
          </div>
        </div>
      )}

      {/* ── History List ── */}
      {/* Rendered when history items exist */}
      {!loading && history.length > 0 && (
        <div className="fade-in"
             style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {history.map((item) => {
            const isPhishing = item.label === 'phishing'
            const labelColor = isPhishing ? '#ff3b5c' : '#00e5a0'
            const modelColor = MODEL_COLORS[item.model_used] || '#00d4ff'

            return (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 16px', borderRadius: 12,
                // Phishing rows get a subtle red tint
                background: isPhishing ? 'rgba(255,59,92,0.03)' : '#111827',
                border: `1px solid ${isPhishing ? 'rgba(255,59,92,0.15)' : '#1e2d45'}`,
              }}>

                {/* Result icon */}
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: `${labelColor}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                }}>
                  {isPhishing ? '⚠' : '✓'}
                </div>

                {/* Email preview (first 100 chars, truncated) */}
                <span style={{
                  flex: 1, fontSize: 12, color: 'rgba(232,244,253,0.6)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.email_preview}
                </span>

                {/* Right-side metadata */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

                  {/* Model badge (BERT / DistilBERT / TinyLLaMA) */}
                  <span style={{
                    fontFamily: 'Space Mono', fontSize: 9,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: modelColor, background: `${modelColor}10`,
                    border: `1px solid ${modelColor}30`,
                    padding: '2px 8px', borderRadius: 20,
                  }}>
                    {item.model_used || 'bert'}
                  </span>

                  {/* Phishing / Safe label */}
                  <span style={{
                    fontFamily: 'Space Mono', fontSize: 10, color: labelColor,
                    textTransform: 'uppercase', letterSpacing: '0.06em', width: 58,
                  }}>
                    {item.label}
                  </span>

                  {/* Confidence % */}
                  <span style={{
                    fontFamily: 'Space Mono', fontSize: 10, color: '#6b7a99', width: 34,
                  }}>
                    {Math.round(item.confidence * 100)}%
                  </span>

                  {/* Timestamp */}
                  <span style={{ fontSize: 11, color: '#4a5568', width: 100, textAlign: 'right' }}>
                    {formatTime(item.timestamp)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
