// =============================================================================
// src/utils/api.js — Axios API Client
// =============================================================================
// This module handles all HTTP communication between the React frontend
// and the FastAPI backend.
//
// axios.create() sets up a base configuration:
//   baseURL: '/api' — all requests are prefixed with /api
//   timeout: 30s    — give up after 30 seconds (model inference can be slow)
//
// The Vite proxy (in vite.config.js) forwards /api/* to localhost:8000
// so we never need to hardcode the backend URL here.
// =============================================================================

import axios from 'axios'

// Create a pre-configured Axios instance for all API calls
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})


// -----------------------------------------------------------------------------
// predictEmail — classify a single email
// -----------------------------------------------------------------------------
// Called by: usePredict hook → DetectorPage
// Backend endpoint: POST /api/predict
//
// Parameters:
//   emailText (string) — the full email content to classify
//   modelKey  (string) — "bert", "distilbert", or "llama"
//
// Returns: PredictResponse object with label, confidence, probabilities, etc.
// -----------------------------------------------------------------------------
export async function predictEmail(emailText, modelKey = 'bert') {
  const { data } = await api.post('/predict', {
    email_text: emailText,   // maps to PredictRequest.email_text in backend
    model_key:  modelKey,    // maps to PredictRequest.model_key in backend
  })
  return data
}


// -----------------------------------------------------------------------------
// getHistory — fetch recent prediction history
// -----------------------------------------------------------------------------
// Called by: HistoryPage on load and on refresh button click
// Backend endpoint: GET /api/history
//
// Parameters:
//   limit  — max number of records (default 50)
//   offset — skip this many records for pagination (default 0)
//
// Returns: array of HistoryItem objects
// -----------------------------------------------------------------------------
export async function getHistory(limit = 50, offset = 0) {
  const { data } = await api.get('/history', {
    params: { limit, offset }
  })
  return data
}


// -----------------------------------------------------------------------------
// clearHistory — delete all history
// -----------------------------------------------------------------------------
// Called by: HistoryPage "Clear All" button
// Backend endpoint: DELETE /api/history
// -----------------------------------------------------------------------------
export async function clearHistory() {
  const { data } = await api.delete('/history')
  return data
}


export default api
