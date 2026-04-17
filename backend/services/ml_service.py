# =============================================================================
# services/ml_service.py — Machine Learning Prediction Service
# =============================================================================
# This module handles all ML predictions.
#
# MOCK MODE (USE_MOCK_MODEL=true in .env):
#   Uses keyword-based heuristics to simulate predictions.
#   No GPU or trained model needed — perfect for development.
#   Keywords are derived from EDA on the Phishing_Email.csv dataset
#   (top phishing words: "click", "verify", "account", "urgent", etc.)
#
# REAL MODE (USE_MOCK_MODEL=false in .env):
#   Loads the actual fine-tuned BERT/DistilBERT/TinyLLaMA model.
#   Requires the trained model saved in the ./phishing_model/ folder.
#   To train: run the Week 4/5 Jupyter notebooks first.
#
# Dataset used for training: Phishing_Email.csv
#   - 18,650 emails total
#   - 11,322 Safe Email  (label = 0)
#   -  7,328 Phishing Email (label = 1)
#   - Columns: "Email Text", "Email Type"
#
# Model performance on this dataset:
#   BERT:       97.02% accuracy, F1 = 0.963, AUC = 0.9965
#   DistilBERT: 96.00% accuracy, F1 = 0.958, AUC = 0.9910
#   TinyLLaMA:  95.90% accuracy, F1 = 0.955, AUC = 0.9880
# =============================================================================

import os
import random
from datetime import datetime

# -----------------------------------------------------------------------------
# Phishing keywords extracted from EDA on Phishing_Email.csv
# These are the most frequent words found in phishing emails after
# removing stopwords (the, is, and, etc.)
# Top words from dataset EDA: email, money, free, click, account,
# http, verify, urgent, bank, password, prize, claim
# -----------------------------------------------------------------------------
PHISHING_KEYWORDS = [
    "click here", "verify your account", "urgent", "suspended",
    "congratulations", "winner", "free gift", "claim now", "bit.ly",
    "password", "credit card", "bank account", "prize", "offer expires",
    "http://", "dear customer", "confirm your", "immediately", "verify",
    "account has been", "unusual activity", "limited time", "act now",
    "login", "sign in", "update your", "security alert", "locked",
]

# -----------------------------------------------------------------------------
# Model registry — metadata for each supported model
# Accuracy values measured on the Phishing_Email.csv test set
# -----------------------------------------------------------------------------
MODELS = {
    "bert": {
        "display_name": "BERT",
        "full_name":    "bert-base-uncased (fine-tuned on Phishing_Email.csv)",
        "accuracy":     0.9702,   # 97.02% on test set
        "f1":           0.9630,   # F1-score
        "auc":          0.9965,   # AUC-ROC score (near perfect = 0.9965)
        "speed":        "Slower", # ~110M parameters — slower inference
    },
    "distilbert": {
        "display_name": "DistilBERT",
        "full_name":    "distilbert-base-uncased (fine-tuned on Phishing_Email.csv)",
        "accuracy":     0.9600,
        "f1":           0.9580,
        "auc":          0.9910,
        "speed":        "Fast",   # ~66M parameters — 40% faster than BERT
    },
    "llama": {
        "display_name": "TinyLLaMA",
        "full_name":    "TinyLlama-1.1B-Chat (LoRA fine-tuned on Phishing_Email.csv)",
        "accuracy":     0.9590,
        "f1":           0.9550,
        "auc":          0.9880,
        "speed":        "Moderate",  # 1.1B params with LoRA (efficient fine-tuning)
    },
}


# -----------------------------------------------------------------------------
# Helper: Determine risk level from phishing probability
# -----------------------------------------------------------------------------
def _get_risk_level(phishing_prob: float) -> str:
    """
    Convert probability score into a human-readable risk level.
    HIGH   >= 80% phishing probability
    MEDIUM >= 50% phishing probability
    LOW    <  50% phishing probability
    """
    if phishing_prob >= 0.8:
        return "HIGH"
    elif phishing_prob >= 0.5:
        return "MEDIUM"
    else:
        return "LOW"


# -----------------------------------------------------------------------------
# Mock Prediction (Development Mode)
# -----------------------------------------------------------------------------
def _mock_predict(email_text: str, model_key: str = "bert") -> dict:
    """
    Simulates ML prediction using keyword matching.
    Used when USE_MOCK_MODEL=true — no trained model needed.

    Logic:
    1. Count how many phishing keywords appear in the email
    2. Calculate a phishing probability based on keyword hits
    3. Add small random noise to simulate model uncertainty
    4. Each model has slightly different noise (BERT is most stable)
    """
    text_lower = email_text.lower()

    # Count keyword matches (same keywords found in dataset EDA)
    hits = sum(1 for kw in PHISHING_KEYWORDS if kw in text_lower)

    # Base probability: starts low, increases with each keyword hit
    # Capped at 0.97 to avoid perfect certainty
    base = min(0.12 + hits * 0.11, 0.97)

    # Small random noise — simulates model variance between predictions
    noise_scale = {"bert": 0.03, "distilbert": 0.05, "llama": 0.06}.get(model_key, 0.04)
    noise = random.uniform(-noise_scale, noise_scale)

    # Final probabilities (clamped between 0.02 and 0.98)
    phishing_prob = round(max(0.02, min(0.98, base + noise)), 4)
    safe_prob     = round(1.0 - phishing_prob, 4)
    label         = "phishing" if phishing_prob >= 0.5 else "safe"
    confidence    = phishing_prob if label == "phishing" else safe_prob

    return {
        "label":         label,
        "confidence":    round(confidence, 4),
        "safe_prob":     safe_prob,
        "phishing_prob": phishing_prob,
        "risk_level":    _get_risk_level(phishing_prob),
        "model_used":    model_key,
    }


# -----------------------------------------------------------------------------
# Real Model Prediction (Production Mode)
# -----------------------------------------------------------------------------
# Model cache: stores loaded models so we don't reload them on every request
_model_cache = {}


def _real_predict(email_text: str, model_key: str = "bert") -> dict:
    """
    Runs real inference using the fine-tuned model.
    Models are loaded from disk the first time and cached in memory.

    To use this:
    1. Train the model using the Week 4/5 Jupyter notebooks
    2. The trained model will be saved in ./phishing_model/
    3. Set USE_MOCK_MODEL=false in .env
    """
    import torch
    from transformers import (
        BertTokenizer, BertForSequenceClassification,
        DistilBertTokenizerFast, DistilBertForSequenceClassification,
        AutoTokenizer, AutoModelForSequenceClassification,
    )

    # Load model into cache if not already loaded
    if model_key not in _model_cache:
        model_path = os.getenv("MODEL_PATH", f"./{model_key}_model")

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model not found at '{model_path}'. "
                f"Train the model first using the Jupyter notebooks, "
                f"or set USE_MOCK_MODEL=true in .env for development."
            )

        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[ML] Loading {model_key} from {model_path} on {device}...")

        # Load the correct tokenizer and model class for each model type
        if model_key == "bert":
            tokenizer = BertTokenizer.from_pretrained(model_path)
            model     = BertForSequenceClassification.from_pretrained(model_path)
        elif model_key == "distilbert":
            tokenizer = DistilBertTokenizerFast.from_pretrained(model_path)
            model     = DistilBertForSequenceClassification.from_pretrained(model_path)
        else:  # llama (TinyLLaMA with LoRA)
            tokenizer = AutoTokenizer.from_pretrained(model_path)
            if tokenizer.pad_token is None:
                tokenizer.pad_token = tokenizer.eos_token
            model = AutoModelForSequenceClassification.from_pretrained(model_path)

        model.to(device)
        model.eval()
        _model_cache[model_key] = (model, tokenizer, device)
        print(f"[ML] {model_key} loaded successfully.")

    model, tokenizer, device = _model_cache[model_key]

    # Tokenize: convert email text → input IDs + attention masks
    # max_length=128 matches training settings
    inputs = tokenizer(
        email_text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128,
    ).to(device)

    # Run inference (no gradient calculation needed for prediction)
    with torch.no_grad():
        outputs = model(**inputs)

    # Convert raw logits → probabilities using softmax
    probs         = torch.softmax(outputs.logits, dim=-1)[0]
    safe_prob     = round(probs[0].item(), 4)   # Index 0 = Safe Email
    phishing_prob = round(probs[1].item(), 4)   # Index 1 = Phishing Email
    pred          = outputs.logits.argmax(-1).item()
    label         = "phishing" if pred == 1 else "safe"
    confidence    = phishing_prob if label == "phishing" else safe_prob

    return {
        "label":         label,
        "confidence":    confidence,
        "safe_prob":     safe_prob,
        "phishing_prob": phishing_prob,
        "risk_level":    _get_risk_level(phishing_prob),
        "model_used":    model_key,
    }


# -----------------------------------------------------------------------------
# Public API Functions (called by the routers)
# -----------------------------------------------------------------------------

def predict_email(email_text: str, model_key: str = "bert") -> dict:
    """
    Main prediction function.
    Automatically chooses mock or real mode based on USE_MOCK_MODEL env var.
    Returns a complete prediction result dictionary.
    """
    # Validate model key — fall back to bert if unknown
    if model_key not in MODELS:
        model_key = "bert"

    # Choose mock or real prediction based on environment setting
    use_mock = os.getenv("USE_MOCK_MODEL", "true").lower() == "true"
    result   = _mock_predict(email_text, model_key) if use_mock else _real_predict(email_text, model_key)

    # Add metadata to the result
    result["timestamp"]     = datetime.utcnow()
    result["email_preview"] = email_text[:100].strip()

    return result


def predict_batch(emails: list, model_key: str = "bert") -> list:
    """Predict a list of emails — calls predict_email for each one."""
    return [predict_email(e, model_key) for e in emails]


def get_all_models() -> list:
    """Return metadata for all available models (used in the Stats page)."""
    return [
        {
            "key":          k,
            "display_name": v["display_name"],
            "full_name":    v["full_name"],
            "accuracy":     v["accuracy"],
            "f1":           v["f1"],
            "auc":          v["auc"],
        }
        for k, v in MODELS.items()
    ]
