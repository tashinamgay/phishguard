// =============================================================================
// src/components/ResultCard.jsx — Prediction Result Display Card
// =============================================================================
// Displays the ML prediction result after an email is analysed.
//
// Shows:
//   - PHISHING or SAFE label (large, colour-coded)
//   - Risk level badge (LOW / MEDIUM / HIGH)
//   - Phishing probability bar (red)
//   - Safe probability bar (green)
//   - Model confidence percentage
//   - Which model was used (BERT / DistilBERT / TinyLLaMA)
//   - Warning box for HIGH risk phishing emails
//
// Props:
//   result (object) — PredictResponse from the backend:
//     {
//       label:         "phishing" | "safe"
//       confidence:    0.0 - 1.0
//       safe_prob:     0.0 - 1.0
//       phishing_prob: 0.0 - 1.0
//       risk_level:    "LOW" | "MEDIUM" | "HIGH"
//       model_used:    "bert" | "distilbert" | "llama"
//     }
// =============================================================================

export default function ResultCard({ result }) {
  // Determine colours based on prediction outcome
  const isPhishing = result.label === 'phishing'
  const color      = isPhishing ? '#ff3b5c' : '#00e5a0'   // red or green

  // Convert probabilities from 0-1 to 0-100 for display
  const phPct   = Math.round(result.phishing_prob * 100)
  const sfPct   = Math.round(result.safe_prob     * 100)
  const confPct = Math.round(result.confidence    * 100)

  // Risk level colour mapping
  const riskColor = {
    HIGH:   '#ff3b5c',   // red
    MEDIUM: '#ffb800',   // amber
    LOW:    '#00e5a0',   // green
  }[result.risk_level] || '#00e5a0'

  return (
    <div
      className="slide-up"   // CSS animation from index.html
      style={{
        width: '100%', borderRadius: 16, padding: 22,
        border:     `1px solid ${color}33`,   // subtle coloured border
        background: `${color}07`,              // very light tinted background
      }}
    >
      {/* ── Header: icon + label + risk badge ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Result icon */}
          <div style={{
            width: 48, height: 48, borderRadius: 12, fontSize: 22,
            background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isPhishing ? '⚠' : '✓'}
          </div>

          {/* PHISHING / SAFE label */}
          <div>
            <div style={{
              fontFamily: 'Space Mono', fontSize: 22, fontWeight: 700, color,
            }}>
              {result.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 3 }}>
              {isPhishing ? 'Threat indicators detected' : 'No phishing indicators found'}
            </div>
          </div>
        </div>

        {/* Risk level badge (LOW / MEDIUM / HIGH) */}
        <span style={{
          fontFamily: 'Space Mono', fontSize: 10, letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20,
          border: `1px solid ${riskColor}44`, background: `${riskColor}10`, color: riskColor,
        }}>
          {result.risk_level} RISK
        </span>
      </div>

      {/* ── Probability Bars ── */}
      {/* Shows how confident the model is in each direction */}
      {[
        { label: 'Phishing', pct: phPct, color: '#ff3b5c' },
        { label: 'Safe',     pct: sfPct, color: '#00e5a0' },
      ].map(bar => (
        <div key={bar.label} style={{ marginBottom: 12 }}>
          {/* Label row with percentage on right */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'Space Mono', fontSize: 11, marginBottom: 5,
          }}>
            <span style={{
              color: '#6b7a99',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {bar.label}
            </span>
            <span style={{ color: bar.color }}>{bar.pct}%</span>
          </div>

          {/* Progress bar track */}
          <div style={{
            height: 5, background: 'rgba(255,255,255,0.06)',
            borderRadius: 3, overflow: 'hidden',
          }}>
            {/* Filled portion — width driven by probability % */}
            <div style={{
              height: '100%', width: `${bar.pct}%`,
              background: bar.color, borderRadius: 3,
              transition: 'width 0.7s ease',   // smooth animation
            }} />
          </div>
        </div>
      ))}

      {/* ── Footer: Confidence + Model Used ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, marginTop: 4,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{
          fontFamily: 'Space Mono', fontSize: 10, color: '#6b7a99',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Confidence
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Model badge — shows which model made the prediction */}
          <span style={{
            fontFamily: 'Space Mono', fontSize: 10, color: '#00d4ff',
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
            padding: '2px 8px', borderRadius: 20,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {result.model_used || 'bert'}
          </span>

          {/* Confidence percentage */}
          <span style={{ fontFamily: 'Space Mono', fontSize: 13, color }}>
            {confPct}%
          </span>
        </div>
      </div>

      {/* ── HIGH RISK Warning Box ── */}
      {/* Only shown when phishing + HIGH risk level */}
      {isPhishing && result.risk_level === 'HIGH' && (
        <div style={{
          marginTop: 14, padding: '10px 14px', borderRadius: 10, fontSize: 12,
          background: 'rgba(255,59,92,0.05)',
          border: '1px solid rgba(255,59,92,0.15)',
          color: 'rgba(255,59,92,0.85)', lineHeight: 1.6,
        }}>
          ⚠ Do not click any links, download attachments, or provide personal information.
        </div>
      )}
    </div>
  )
}
