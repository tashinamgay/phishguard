# =============================================================================
# routers/history.py — Prediction History Endpoints
# =============================================================================
# Endpoints for retrieving and clearing prediction history:
#   GET    /api/history — return recent predictions (newest first)
#   DELETE /api/history — clear all stored predictions
# =============================================================================

from fastapi import APIRouter, Query
from models.schemas       import HistoryItem
from services.history_service import get_history, clear_history

router = APIRouter()


# -----------------------------------------------------------------------------
# GET /api/history — Retrieve Prediction History
# -----------------------------------------------------------------------------
@router.get("/history", response_model=list[HistoryItem])
async def get_prediction_history(
    limit:  int = Query(default=20, ge=1,  le=100, description="Number of records to return"),
    offset: int = Query(default=0,  ge=0,          description="Number of records to skip"),
):
    """
    Return stored prediction history, newest first.
    Supports pagination via limit and offset query parameters.

    Example: GET /api/history?limit=10&offset=0
    """
    items = get_history(limit=limit, offset=offset)
    return [HistoryItem(**item) for item in items]


# -----------------------------------------------------------------------------
# DELETE /api/history — Clear All History
# -----------------------------------------------------------------------------
@router.delete("/history")
async def clear_prediction_history():
    """
    Delete all stored prediction history.
    Called when the user clicks "Clear All" on the History page.
    """
    clear_history()
    return {"message": "History cleared successfully."}
