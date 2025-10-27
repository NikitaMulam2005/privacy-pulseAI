import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from joblib import dump
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Toy dataset with all 8 features - replace with real labelled data
data = [
    {
        "length_chars": 200,
        "num_sentences": 5,
        "avg_sentence_length": 40,
        "num_risks": 0,
        "uses_third_party": 0,
        "mentions_cookies": 0,
        "mentions_data_sale": 0,
        "mentions_tracking": 0,
        "label": 0
    },
    {
        "length_chars": 4500,
        "num_sentences": 120,
        "avg_sentence_length": 37,
        "num_risks": 2,
        "uses_third_party": 1,
        "mentions_cookies": 1,
        "mentions_data_sale": 0,
        "mentions_tracking": 1,
        "label": 1
    },
    {
        "length_chars": 8000,
        "num_sentences": 300,
        "avg_sentence_length": 27,
        "num_risks": 4,
        "uses_third_party": 1,
        "mentions_cookies": 1,
        "mentions_data_sale": 1,
        "mentions_tracking": 1,
        "label": 1
    },
    {
        "length_chars": 1500,
        "num_sentences": 40,
        "avg_sentence_length": 37,
        "num_risks": 1,
        "uses_third_party": 0,
        "mentions_cookies": 0,
        "mentions_data_sale": 0,
        "mentions_tracking": 0,
        "label": 0
    },
]

df = pd.DataFrame(data)

# Features (all 8)
X = df[
    [
        "length_chars",
        "num_sentences",
        "avg_sentence_length",
        "num_risks",
        "uses_third_party",
        "mentions_cookies",
        "mentions_data_sale",
        "mentions_tracking"
    ]
]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = RandomForestClassifier(n_estimators=50, random_state=42)
clf.fit(X_train, y_train)

print("Training accuracy:", clf.score(X_test, y_test))

dump(clf, os.path.join(OUTPUT_DIR, "trained_model_8_features.pkl"))
print("Model saved to", os.path.join(OUTPUT_DIR, "trained_model_8_features.pkl"))
