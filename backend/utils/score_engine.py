import os, logging, pandas as pd
from joblib import load
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ai_pipeline", "output", "trained_model_8_features.pkl")

def load_model():
    if os.path.exists(MODEL_PATH):
        logger.info(f"Loading model from {MODEL_PATH}")
        return load(MODEL_PATH)
    else:
        logger.warning(f"No trained model found at {MODEL_PATH}. Using heuristic fallback.")
        return None

model = load_model()

EXPECTED_FEATURES = [
    "length_chars", "num_sentences", "avg_sentence_length", "num_risks",
    "uses_third_party", "mentions_cookies", "mentions_data_sale", "mentions_tracking"
]

def predict_risk(features: dict):
    try:
        feature_vector = pd.DataFrame([{k: float(features.get(k, 0.0)) for k in EXPECTED_FEATURES}])
        if model:
            prob = model.predict_proba(feature_vector)[0][1]
            score = float(prob * 100)
        else:
            raise ValueError("Model not loaded")
    except Exception as e:
        logger.exception(f"[Score Engine] Model prediction failed: {e}")
        score = min(
            100,
            features.get("num_risks", 0) * 40 +
            (1 if features.get("length_chars", 0) > 5000 else 0) * 20
        )

    classification = "Safe" if score < 33 else "Neutral" if score < 66 else "Risky"
    return {"classification": classification, "score": round(score, 2)}
