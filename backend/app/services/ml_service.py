import pandas as pd
import joblib
from pathlib import Path

# backend/app/services/ml_service.py -> backend/
BACKEND_DIR = Path(__file__).resolve().parents[2]
MODELS_DIR = BACKEND_DIR / "saved_models"

PRIORITY_MODEL_PATH = MODELS_DIR / "priority_model.pkl"
CLOSURE_MODEL_PATH = MODELS_DIR / "road_closure_model_v2.pkl"

print(f"ML models directory: {MODELS_DIR.resolve()}")
print(f"Loading priority model from: {PRIORITY_MODEL_PATH.resolve()}")
print(f"Loading closure model from: {CLOSURE_MODEL_PATH.resolve()}")

if not PRIORITY_MODEL_PATH.is_file():
    raise FileNotFoundError(f"Priority model not found: {PRIORITY_MODEL_PATH}")
if not CLOSURE_MODEL_PATH.is_file():
    raise FileNotFoundError(f"Closure model not found: {CLOSURE_MODEL_PATH}")

priority_model = joblib.load(PRIORITY_MODEL_PATH)
closure_model = joblib.load(CLOSURE_MODEL_PATH)

print(f"Priority model loaded successfully ({type(priority_model).__name__})")
print(f"Closure model loaded successfully ({type(closure_model).__name__})")

CLOSURE_DEFAULTS = {
    "corridor": "Unknown Corridor",
}


def predict_priority(payload: dict):

    df = pd.DataFrame([payload])

    pred = priority_model.predict(df)[0]

    probs = priority_model.predict_proba(df)[0]

    return {
        "label": "HIGH" if pred == 1 else "LOW",
        "confidence": round(float(max(probs)) * 100, 2)
    }


def predict_closure(payload: dict):

    enriched = {**CLOSURE_DEFAULTS, **payload}
    df = pd.DataFrame([enriched])

    pred = closure_model.predict(df)[0]

    probs = closure_model.predict_proba(df)[0]

    return {
        "closure_required": bool(pred),
        "closure_probability": round(float(probs[1]) * 100, 2)
    }
