// =============================================================================
// src/pages/DetectorPage.jsx — Main Email Analysis Page
// =============================================================================
// This is the primary page of the app (route: /).
//
// What it does:
//   1. User selects a model (BERT / DistilBERT / TinyLLaMA)
//   2. User pastes an email into the textarea
//   3. User clicks "Analyse with [Model]"
//   4. Frontend sends POST /api/predict to the backend
//   5. Result is displayed in ResultCard on the right side
//
// Components used:
//   ModelSelector — 3-button model picker
//   Spinner       — loading animation while waiting for prediction
//   ResultCard    — displays the prediction result
//
// State managed here:
//   text          — current email textarea content
//   selectedModel — which ML model is currently active
//   result/loading/error — managed by the usePredict hook
// =============================================================================

import { useState } from 'react'
import { usePredict }    from '../hooks/usePredict'
import ModelSelector     from '../components/ModelSelector'
import ResultCard        from '../components/ResultCard'
import Spinner           from '../components/Spinner'

// Human-readable model names for button labels
const MODEL_LABELS = {
  bert:       'BERT',
  distilbert: 'DistilBERT',
  llama:      'TinyLLaMA',
}

export default function DetectorPage() {
  // Email text entered by the user
  const [text, setText] = useState('')

  // Currently selected model key ("bert" by default — highest accuracy)
  const [selectedModel, setSelectedModel] = useState('bert')

  // Prediction state from custom hook
  const { result, loading, error, predict, reset } = usePredict()

  // --------------------------------------------------------------------------
  // handleSubmit — called when user clicks "Analyse" button
  // --------------------------------------------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim().length < 5) return   // Don't submit if email is too short
    predict(text.trim(), selectedModel)   // Send to backend via usePredict hook
  }

  // --------------------------------------------------------------------------
  // handleClear — resets textarea and clears result
  // --------------------------------------------------------------------------
  const handleClear = () => {
    setText('')
    reset()
  }

  // Button is disabled when loading or email is too short
  const canSubmit = !loading && text.trim().length >= 5

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'Space Mono', fontSize: 18,
          fontWeight: 700, color: '#e8f4fd', margin: 0,
        }}>
          Email Threat Detector
        </h1>
        <p style={{ fontSize: 13, color: '#6b7a99', marginTop: 5 }}>
          Select a model, paste an email, and click Analyse
        </p>
      </div>

      {/* ── Two-column layout: Left=Input, Right=Result ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>

        {/* ============================================================
            LEFT COLUMN — Model selector + email input form
            ============================================================ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Model selector buttons (BERT / DistilBERT / TinyLLaMA) */}
          <ModelSelector
            selected={selectedModel}
            onChange={(key) => {
              setSelectedModel(key)
              reset()   // Clear previous result when model changes
            }}
          />

          {/* Email input form */}
          <form onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* ── Email Textarea ── */}
            <textarea
              value={text}
              onChange={e => {
                setText(e.target.value)
                if (result) reset()   // Clear result when user starts typing
              }}
              placeholder="Paste email content here..."
              disabled={loading}
              rows={12}
              style={{
                width: '100%', background: '#111827',
                border: '1px solid #1e2d45', borderRadius: 12,
                padding: '14px 16px', color: '#e8f4fd',
                fontSize: 13, fontFamily: 'DM Sans', lineHeight: 1.7,
                resize: 'none', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.35)'}
              onBlur={e  => e.target.style.borderColor = '#1e2d45'}
            />

            {/* ── Analyse Button ── */}
            {/* Label changes to show which model will be used */}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                padding: '12px', borderRadius: 12, border: 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontFamily: 'Space Mono', fontSize: 12,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                // Blue when ready, grey when disabled
                background: canSubmit ? '#00d4ff' : '#1e2d45',
                color:      canSubmit ? '#060810' : '#4a5568',
                transition: 'all 0.15s',
              }}
            >
              {loading
                ? `Analysing with ${MODEL_LABELS[selectedModel]}...`
                : `Analyse with ${MODEL_LABELS[selectedModel]}`}
            </button>

            {/* ── Clear Button ── */}
            {/* Only visible when there is text or a result to clear */}
            {(text || result) && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  padding: '9px', borderRadius: 10,
                  border: '1px solid #1e2d45', background: 'transparent',
                  color: '#6b7a99', cursor: 'pointer',
                  fontSize: 12, fontFamily: 'Space Mono', letterSpacing: '0.06em',
                }}
              >
                Clear
              </button>
            )}
          </form>

          {/* ── Error Message ── */}
          {/* Shown if the backend returns an error */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 12, fontSize: 13,
              background: 'rgba(255,59,92,0.05)',
              border: '1px solid rgba(255,59,92,0.25)',
              color: '#ff3b5c',
            }}>
              {error}
            </div>
          )}
        </div>

        {/* ============================================================
            RIGHT COLUMN — Shows Spinner, ResultCard, or empty state
            ============================================================ */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>

          {/* Loading state — shown while backend is processing */}
          {loading && (
            <Spinner message={`Running ${MODEL_LABELS[selectedModel]}...`} />
          )}

          {/* Result state — shown after successful prediction */}
          {!loading && result && (
            <ResultCard result={result} />
          )}

          {/* Empty state — shown before any prediction is made */}
          {!loading && !result && (
            <div style={{
              width: '100%', minHeight: 340,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
              border: '1px solid #1e2d45', borderRadius: 14,
              background: '#111827',
            }}>
              {/* Shield placeholder icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: '#161d2e', border: '1px solid #1e2d45',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>
                🛡
              </div>
              <div style={{
                fontFamily: 'Space Mono', fontSize: 11, color: '#4a5568',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                Awaiting Analysis
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
