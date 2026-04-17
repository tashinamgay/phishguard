# =============================================================================
# models/schemas.py — Pydantic Data Models (Request & Response Shapes)
# =============================================================================
# Pydantic models define the exact shape of data that comes IN to the API
# (requests) and goes OUT from the API (responses).
# FastAPI uses these to automatically validate data and generate API docs.
#
# Dataset context:
#   Our dataset (Phishing_Email.csv) has two label values:
#     "Safe Email"     → encoded as 0 in training
#     "Phishing Email" → encoded as 1 in training
#   The EmailLabel enum below mirrors this binary classification.
# =============================================================================

from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


# -----------------------------------------------------------------------------
# Email Label Enum
# -----------------------------------------------------------------------------
# Represents the two possible prediction outcomes.
# Matches the labels in Phishing_Email.csv:
#   "Safe Email"     → safe
#   "Phishing Email" → phishing
# -----------------------------------------------------------------------------
class EmailLabel(str, Enum):
    SAFE     = "safe"
    PHISHING = "phishing"


# -----------------------------------------------------------------------------
# Request Model — Single Email Prediction
# -----------------------------------------------------------------------------
# This is the JSON body the frontend sends when clicking "Analyse Email".
# Example:
#   { "email_text": "Dear customer, click here...", "model_key": "bert" }
# -----------------------------------------------------------------------------
class PredictRequest(BaseModel):
    # The full email text to classify (min 5 chars, max 10,000 chars)
    email_text: str = Field(..., min_length=5, max_length=10000)

    # Which ML model to use: "bert", "distilbert", or "llama"
    # Defaults to BERT (highest accuracy: 97.02% on our dataset)
    model_key: str = Field(default="bert")


# -----------------------------------------------------------------------------
# Request Model — Batch Email Prediction
# -----------------------------------------------------------------------------
# Used by the batch endpoint to classify multiple emails at once.
# -----------------------------------------------------------------------------
class BatchPredictRequest(BaseModel):
    emails:    list[str] = Field(..., min_length=1, max_length=50)
    model_key: str       = Field(default="bert")


# -----------------------------------------------------------------------------
# Response Model — Single Email Prediction Result
# -----------------------------------------------------------------------------
# This is the JSON the backend sends back after classifying an email.
# The frontend uses this to display the result card.
# -----------------------------------------------------------------------------
class PredictResponse(BaseModel):
    label:         EmailLabel  # "phishing" or "safe"
    confidence:    float       # How confident the model is (0.0 to 1.0)
    safe_prob:     float       # Probability the email is safe
    phishing_prob: float       # Probability the email is phishing
    timestamp:     datetime    # When the prediction was made
    email_preview: str         # First 100 characters of the email
    risk_level:    str         # "LOW", "MEDIUM", or "HIGH"
    model_used:    str = "bert"  # Which model made the prediction


# -----------------------------------------------------------------------------
# Response Model — Batch Prediction Result
# -----------------------------------------------------------------------------
class BatchPredictResponse(BaseModel):
    results:        list[PredictResponse]  # Individual result for each email
    total:          int                    # Total emails analysed
    phishing_count: int                    # How many were flagged as phishing
    safe_count:     int                    # How many were classified as safe


# -----------------------------------------------------------------------------
# History Item Model
# -----------------------------------------------------------------------------
# Represents a single entry in the prediction history list.
# -----------------------------------------------------------------------------
class HistoryItem(BaseModel):
    id:            int         # Auto-incrementing ID
    label:         EmailLabel
    confidence:    float
    risk_level:    str
    email_preview: str
    timestamp:     datetime
    model_used:    str = "bert"
