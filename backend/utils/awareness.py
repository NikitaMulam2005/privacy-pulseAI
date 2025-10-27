import random
import logging

PRIVACY_TIPS = [
    "Avoid reusing passwords across different websites.",
    "Use privacy-focused browsers like Brave or Firefox.",
    "Always review app permissions before installation.",
    "Disable third-party cookies in your browser settings.",
    "Use 2FA (Two-Factor Authentication) wherever possible.",
    "Don’t post personal details like DOB or location publicly.",
    "Keep your software and OS updated regularly.",
]

QUIZ = [
    {"q": "Is it safe to use the same password for all websites?", "a": "No"},
    {"q": "Should you cover your webcam when not in use?", "a": "Yes"},
    {"q": "Can VPNs help protect your browsing privacy?", "a": "Yes"},
]

LEADERBOARD = [
    {"name": "Anon", "score": 92},
    {"name": "User42", "score": 86},
    {"name": "PrivacyNinja", "score": 81},
]


def get_awareness_content():
    """Return dynamic awareness data for frontend"""
    try:
        tip = random.choice(PRIVACY_TIPS)
        return {
            "tip": tip,
            "quiz": QUIZ,
            "leaderboard": LEADERBOARD,
        }
    except Exception as e:
        logging.exception("awareness content generation failed")
        return {"tip": "Error loading tips.", "quiz": [], "leaderboard": []}
