# =============================================================================
# routers/predict.py — Prediction API Endpoints
# =============================================================================
# Handles the core ML prediction endpoints:
#   POST /api/predict        — classify a single email
#   POST /api/predict/batch  — classify up to 50 emails at once
#
# Flow:
#   1. Frontend sends email text + model choice (bert/distilbert/llama)
#   2. This router validates the request using Pydantic schemas
#   3. Calls ml_service.predict_email() to get the prediction
#   4. Saves result to history
#   5. Returns the prediction result to the frontend
# =============================================================================

from fastapi import APIRouter, HTTPException
from models.schemas import (
    PredictRequest, PredictResponse,
    BatchPredictRequest, BatchPredictResponse
)
from services.ml_service      import predict_email, predict_batch
from services.history_service import add_to_history

router = APIRouter()


# -----------------------------------------------------------------------------
# POST /api/predict — Single Email Classification
# -----------------------------------------------------------------------------
@router.post("/predict", response_model=PredictResponse)
async def classify_email(request: PredictRequest):
    """
    Classify a single email as phishing or safe.

    Request body:
        email_text (str): The email content to analyse
        model_key  (str): Which model to use — "bert", "distilbert", or "llama"

    Returns:
        PredictResponse with label, confidence, probabilities, and risk level
    """
    try:
        # Run prediction using the selected model
        result = predict_email(request.email_text, request.model_key)

        # Save the prediction to history
        add_to_history(result)

        # Return structured response (Pydantic validates it)
        return PredictResponse(**result)

    except Exception as e:
        # Return HTTP 500 with error details if something goes wrong
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------------------------------------
# POST /api/predict/batch — Batch Email Classification
# -----------------------------------------------------------------------------
@router.post("/predict/batch", response_model=BatchPredictResponse)
async def classify_batch(request: BatchPredictRequest):
    """
    Classify multiple emails at once (max 50 per request).

    Request body:
        emails    (list[str]): List of email texts
        model_key (str):       Which model to use

    Returns:
        BatchPredictResponse with individual results + summary counts
    """
    if len(request.emails) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 emails per batch.")

    try:
        # Predict all emails using the same model
        results   = predict_batch(request.emails, request.model_key)
        responses = []

        for r in results:
            add_to_history(r)
            responses.append(PredictResponse(**r))

        # Count phishing vs safe for the summary
        phishing_count = sum(1 for r in responses if r.label == "phishing")

        return BatchPredictResponse(
            results=responses,
            total=len(responses),
            phishing_count=phishing_count,
            safe_count=len(responses) - phishing_count,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
