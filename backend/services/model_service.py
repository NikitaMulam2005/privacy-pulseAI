import re
import numpy as np
import joblib
import logging
from sklearn.feature_extraction.text import TfidfVectorizer

try:
    model = joblib.load("models/transparency_model.pkl")
    vectorizer = joblib.load("models/vectorizer.pkl")
    print("Loaded trained model and vectorizer.")
except Exception:
    print("No trained model found. Using fallback scoring system.")
    model = None
    vectorizer = None

def extract_features(policy_text: str):
    """
    Basic keyword-based scoring fallback if ML model not available.
    Returns: Dict of computed heuristic scores.
    """
    text = policy_text.lower()
    features = {
        "data_collection": len(re.findall(r"collect|gather|store|retain", text)),
        "third_party": len(re.findall(r"third.?party|affiliate|partner", text)),
        "tracking": len(re.findall(r"track|cookie|analytics|beacon", text)),
        "sharing": len(re.findall(r"share|sell|disclose|transfer", text)),
        "user_rights": len(re.findall(r"access|delete|opt.?out|control|consent", text)),
    }
    return features

def predict_transparency(policy_text: str) -> dict:
    """
    Input: privacy policy text
    Output: {
        "score": float,
        "label": "Safe" | "Neutral" | "Risky",
        "confidence": float
    }
    """
    try:
        if model and vectorizer:
            X = vectorizer.transform([policy_text])
            pred_prob = model.predict_proba(X)[0]
            pred_label = np.argmax(pred_prob)
            confidence = float(np.max(pred_prob))
            score = round(confidence * 100, 2)

            # interpret labels
            label_map = {0: "Risky", 1: "Neutral", 2: "Safe"}
            label = label_map.get(pred_label, "Neutral")
            return {"score": score, "label": label, "confidence": confidence}


        feats = extract_features(policy_text)

        risk_points = (
            feats["data_collection"] * 2 +
            feats["third_party"] * 3 +
            feats["tracking"] * 2 +
            feats["sharing"] * 4 -
            feats["user_rights"] * 3
        )

        raw_score = max(0, 100 - risk_points * 2)
        score = min(raw_score, 100)

        if score > 75:
            label = "Safe"
        elif score > 45:
            label = "Neutral"
        else:
            label = "Risky"

        return {
            "score": round(score, 2),
            "label": label,
            "confidence": round(abs(score - 50) / 50, 2)
        }

    except Exception as e:
        logging.exception("Model prediction failed.")
        return {"score": 0.0, "label": "Unknown", "confidence": 0.0}
