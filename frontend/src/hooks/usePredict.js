// =============================================================================
// src/hooks/usePredict.js — Custom React Hook for Email Prediction
// =============================================================================
// A custom hook that manages the state and logic for making predictions.
//
// Why a custom hook?
//   It separates the prediction logic from the UI component (DetectorPage).
//   DetectorPage only needs to call predict() and read result/loading/error.
//   All the async handling, error catching, and state management is here.
//
// Usage in DetectorPage:
//   const { result, loading, error, predict, reset } = usePredict()
//   predict("Dear customer, click here...", "bert")
// =============================================================================

import { useState, useCallback } from 'react'
import { predictEmail } from '../utils/api'

export function usePredict() {
  // result  — the prediction response object (null until prediction is made)
  // loading — true while waiting for the backend response
  // error   — error message string if something went wrong (null otherwise)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // --------------------------------------------------------------------------
  // predict() — send email to backend and store the result
  // --------------------------------------------------------------------------
  // useCallback prevents this function from being recreated on every render,
  // which avoids unnecessary re-renders in child components.
  // --------------------------------------------------------------------------
  const predict = useCallback(async (emailText, modelKey = 'bert') => {
    // Reset state before starting a new prediction
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Call the API — this sends POST /api/predict to the backend
      const data = await predictEmail(emailText, modelKey)
      setResult(data)   // Store the prediction result

    } catch (err) {
      // Show a user-friendly error message
      // err.response?.data?.detail comes from FastAPI's HTTPException
      setError(err.response?.data?.detail || err.message || 'Prediction failed')

    } finally {
      // Always stop loading, whether success or failure
      setLoading(false)
    }
  }, [])

  // --------------------------------------------------------------------------
  // reset() — clear the current result and error
  // --------------------------------------------------------------------------
  // Called when the user clears the textarea or changes the model selection
  // --------------------------------------------------------------------------
  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, predict, reset }
}
