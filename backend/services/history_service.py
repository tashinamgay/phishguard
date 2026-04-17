# =============================================================================
# services/history_service.py — Prediction History Store
# =============================================================================
# Stores all prediction results in memory during the server session.
# History is cleared when the server restarts.
#
# For a production app, replace this with a real database (SQLite/PostgreSQL).
# =============================================================================

from datetime import datetime

# In-memory storage — simple Python list acting as a database
_history: list = []
_next_id: int  = 1   # Auto-incrementing ID counter


def add_to_history(prediction: dict) -> dict:
    """
    Save a new prediction result to history.
    Called automatically after every /api/predict request.
    """
    global _next_id

    item = {
        "id":            _next_id,
        "label":         prediction["label"],
        "confidence":    prediction["confidence"],
        "risk_level":    prediction["risk_level"],
        "email_preview": prediction["email_preview"],  # First 100 chars
        "timestamp":     prediction.get("timestamp", datetime.utcnow()),
        "model_used":    prediction.get("model_used", "bert"),
    }

    _history.append(item)
    _next_id += 1
    return item


def get_history(limit: int = 50, offset: int = 0) -> list:
    """
    Return prediction history, newest first.
    limit  — max number of records to return
    offset — skip this many records (for pagination)
    """
    return list(reversed(_history))[offset: offset + limit]


def clear_history():
    """Clear all stored history and reset the ID counter."""
    global _history, _next_id
    _history = []
    _next_id = 1


def get_summary_stats() -> dict:
    """
    Calculate aggregate statistics across all predictions.
    Used by the /api/stats endpoint.
    """
    if not _history:
        return {
            "total_predictions": 0,
            "phishing_detected": 0,
            "safe_detected":     0,
            "avg_confidence":    0.0,
        }

    total    = len(_history)
    phishing = sum(1 for h in _history if h["label"] == "phishing")
    avg_conf = sum(h["confidence"] for h in _history) / total

    return {
        "total_predictions": total,
        "phishing_detected": phishing,
        "safe_detected":     total - phishing,
        "avg_confidence":    round(avg_conf, 4),
    }
