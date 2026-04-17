// =============================================================================
// src/components/ModelSelector.jsx — ML Model Picker
// =============================================================================
// Displays three buttons allowing the user to choose which model to use
// for email analysis.
//
// Models available (all trained on Phishing_Email.csv — 18,650 emails):
//   BERT       — bert-base-uncased, 97.02% accuracy, 110M parameters
//   DistilBERT — distilbert-base-uncased, 96.00% accuracy, 66M parameters
//   TinyLLaMA  — TinyLlama-1.1B with LoRA, 95.90% accuracy, 1.1B parameters
//
// Props:
//   selected (string) — currently selected model key ("bert"/"distilbert"/"llama")
//   onChange (func)   — called with the new model key when user clicks a button
// =============================================================================

// Model definitions — colour coded for visual distinction
const MODELS = [
  { key: 'bert',       label: 'BERT',       color: '#00d4ff' }, // signal blue
  { key: 'distilbert', label: 'DistilBERT', color: '#00e5a0' }, // green
  { key: 'llama',      label: 'TinyLLaMA',  color: '#a78bfa' }, // purple
]

export default function ModelSelector({ selected, onChange }) {
  return (
    <div>
      {/* Section label */}
      <p style={{
        fontFamily: 'Space Mono', fontSize: 10, color: '#6b7a99',
        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8,
      }}>
        Select Model
      </p>

      {/* Three model buttons in a grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {MODELS.map((m) => {
          const isActive = selected === m.key

          return (
            <button
              key={m.key}
              onClick={() => onChange(m.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                // Active button gets coloured border and tinted background
                border:     isActive ? `1px solid ${m.color}55` : '1px solid #1e2d45',
                background: isActive ? `${m.color}12`           : '#161d2e',
                transition: 'all 0.15s',
              }}
            >
              {/* Coloured dot indicator — filled when active, grey when inactive */}
              <span style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: isActive ? m.color : '#4a5568',
              }} />

              {/* Model name */}
              <span style={{
                fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700,
                color: isActive ? m.color : '#e8f4fd',
              }}>
                {m.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
