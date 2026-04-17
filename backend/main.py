# =============================================================================
# main.py — FastAPI Application Entry Point
# =============================================================================
# This is the starting point of the backend server.
# It creates the FastAPI app, sets up CORS (so the React frontend can talk
# to it), and registers all the API route groups (routers).
#
# Run this file with:
#   uvicorn main:app --reload --port 8000
# =============================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import the three route groups
from routers import predict, history, stats

# -----------------------------------------------------------------------------
# Create the FastAPI application instance
# -----------------------------------------------------------------------------
app = FastAPI(
    title="Phishing Email Detector API",
    version="1.0.0",
    description="Backend API for detecting phishing emails using ML models (BERT, DistilBERT, TinyLLaMA)"
)

# -----------------------------------------------------------------------------
# CORS Middleware
# -----------------------------------------------------------------------------
# CORS (Cross-Origin Resource Sharing) allows the React frontend running on
# localhost:5173 to make requests to this backend on localhost:8000.
# Without this, the browser would block all API calls.
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],   # Allow GET, POST, DELETE, etc.
    allow_headers=["*"],   # Allow all headers
)

# -----------------------------------------------------------------------------
# Register Routers (Route Groups)
# -----------------------------------------------------------------------------
# Each router handles a specific group of API endpoints:
#   /api/predict  — classify emails as phishing or safe
#   /api/history  — store and retrieve past predictions
#   /api/stats    — model performance statistics
# -----------------------------------------------------------------------------
app.include_router(predict.router, prefix="/api", tags=["Prediction"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(stats.router,   prefix="/api", tags=["Stats"])


# -----------------------------------------------------------------------------
# Root Health Check Endpoint
# -----------------------------------------------------------------------------
# Visit http://localhost:8000 to confirm the server is running.
# -----------------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "status":  "ok",
        "message": "Phishing Email Detector API is running",
        "docs":    "/docs"   # Swagger UI available at /docs
    }


# -----------------------------------------------------------------------------
# Run directly (alternative to uvicorn command)
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
