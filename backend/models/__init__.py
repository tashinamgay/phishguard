# Export all schema classes so other modules can import from "models" directly
from .schemas import (
    PredictRequest, PredictResponse,
    BatchPredictRequest, BatchPredictResponse,
    HistoryItem, EmailLabel
)
