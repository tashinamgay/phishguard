# =============================================================================
# routers/stats.py — Model Statistics Endpoint
# =============================================================================
# Endpoint:
#   GET /api/stats — return model performance metrics + usage statistics
#
# The benchmark metrics below come from evaluating each model on the
# Phishing_Email.csv test set (20% holdout from 18,650 total emails).
# =============================================================================

from fastapi import APIRouter
from services.history_service import get_summary_stats

router = APIRouter()

# -----------------------------------------------------------------------------
# Model benchmark metrics — measured on Phishing_Email.csv test set
# Training details:
#   Dataset: 18,650 emails (11,322 safe + 7,328 phishing)
#   Split: 70% train / 10% validation / 20% test
#   Epochs: 5 for all models
#   Max token length: 128
# -----------------------------------------------------------------------------
BENCHMARKS = {
    "bert": {
        "accuracy":  0.9702,  # 97.02% — best overall accuracy
        "precision": 0.9700,  # 97% — low false positives
        "recall":    0.9600,  # 96% — catches most phishing emails
        "f1_score":  0.9630,  # F1 = harmonic mean of precision and recall
        "auc_score": 0.9965,  # AUC near 1.0 = near-perfect separation
    },
    "distilbert": {
        "accuracy":  0.9600,
        "precision": 0.9580,
        "recall":    0.9570,
        "f1_score":  0.9575,
        "auc_score": 0.9910,
    },
    "llama": {
        "accuracy":  0.9590,
        "precision": 0.9560,
        "recall":    0.9540,
        "f1_score":  0.9550,
        "auc_score": 0.9880,
    },
}


# -----------------------------------------------------------------------------
# GET /api/stats — Return Statistics
# -----------------------------------------------------------------------------
@router.get("/stats")
async def get_stats():
    """
    Return model benchmark metrics and current session usage stats.
    Combines:
      - Static benchmark results from training on Phishing_Email.csv
      - Dynamic usage stats (how many predictions made this session)
    """
    # Get live usage stats from the history service
    usage = get_summary_stats()

    return {
        # Session usage stats (dynamic — changes as users analyse emails)
        "total_predictions": usage["total_predictions"],
        "phishing_detected": usage["phishing_detected"],
        "safe_detected":     usage["safe_detected"],
        "avg_confidence":    usage["avg_confidence"],

        # Benchmark metrics per model (static — from training results)
        "benchmarks":        BENCHMARKS,

        # Top-level BERT metrics for backward compatibility
        "model_name":        "BERT / DistilBERT / TinyLLaMA (trained on Phishing_Email.csv)",
        "accuracy":          BENCHMARKS["bert"]["accuracy"],
        "precision":         BENCHMARKS["bert"]["precision"],
        "recall":            BENCHMARKS["bert"]["recall"],
        "f1_score":          BENCHMARKS["bert"]["f1_score"],
        "auc_score":         BENCHMARKS["bert"]["auc_score"],
    }
