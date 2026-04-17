# PhishGuard — AI Phishing Email Detector

A full-stack web application that detects phishing emails using fine-tuned transformer models.

## Models
- BERT (97.02% accuracy)
- DistilBERT (96.00% accuracy)
- TinyLLaMA with LoRA (95.90% accuracy)

## Dataset
- Phishing_Email.csv — 18,650 emails (11,322 safe + 7,328 phishing)

## Tech Stack
- Frontend: React + Vite
- Backend: FastAPI + Python 3.11

## How to Run
cd backend → venv\Scripts\activate → uvicorn main:app --reload --port 8000
cd frontend → npm run dev → open http://localhost:5173
