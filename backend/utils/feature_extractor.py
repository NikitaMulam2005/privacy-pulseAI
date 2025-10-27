import re

def extract_features(policy_text: str, summary: dict) -> dict:
    txt = policy_text or ""
    lower_txt = txt.lower()

    length_chars = len(txt)
    num_sentences = txt.count(".") or 1
    avg_sentence_length = len(txt.split()) / num_sentences

    risks = summary.get("risks", [])
    num_risks = len(risks)

    uses_third_party = 1 if ("third party" in lower_txt or "third-party" in lower_txt) else 0
    mentions_cookies = 1 if "cookie" in lower_txt else 0
    mentions_data_sale = 1 if "sell" in lower_txt or "sale of data" in lower_txt else 0
    mentions_tracking = 1 if "track" in lower_txt or "analytics" in lower_txt else 0

    return {
        "length_chars": length_chars,
        "num_sentences": num_sentences,
        "avg_sentence_length": avg_sentence_length,
        "num_risks": num_risks,
        "uses_third_party": uses_third_party,
        "mentions_cookies": mentions_cookies,
        "mentions_data_sale": mentions_data_sale,
        "mentions_tracking": mentions_tracking,
    }
