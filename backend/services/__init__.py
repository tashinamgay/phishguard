# Export service functions so routers can import them cleanly
from .ml_service      import predict_email, predict_batch, get_all_models
from .history_service import add_to_history, get_history, get_summary_stats, clear_history
