import os
import json
import logging
from dotenv import load_dotenv
import google.generativeai as genai
import re

# ------------------ Setup -----------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("Gemini API key missing!")

genai.configure(api_key=GEMINI_API_KEY)
logging.basicConfig(level=logging.INFO)

MAX_PROMPT_LENGTH = 12000
SAFE_MIN_LENGTH = 30
SAFE_MAX_LENGTH = 250

# ------------------ Helpers -----------------
def clean_json_string(s: str) -> str:
    if isinstance(s, str) and s.startswith("```") and s.endswith("```"):
        lines = s.splitlines()
        if len(lines) > 2:
            return "\n".join(lines[1:-1]).strip()
    return s.strip() if isinstance(s, str) else s

def chunk_text(text, max_length=4000):
    return [text[i:i + max_length] for i in range(0, len(text), max_length)]

def fallback_summary(text: str) -> str:
    """Lightweight summary fallback (no HuggingFace)."""
    return (text[:500] + "...") if len(text) > 600 else text

# ------------------ Gemini Core ------------------
def _call_gemini(prompt_text: str, max_output_tokens: int = 1500, hf_fallback: str = "") -> str:
    try:
        if not prompt_text:
            return hf_fallback or "Gemini produced no output."

        if len(prompt_text) > MAX_PROMPT_LENGTH:
            prompt_text = prompt_text[:MAX_PROMPT_LENGTH]

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt_text,
            generation_config={"max_output_tokens": max_output_tokens},
        )

        text_output = ""
        for c in getattr(response, "candidates", []):
            for part in getattr(getattr(c, "content", None), "parts", []):
                if hasattr(part, "text") and part.text.strip():
                    text_output += part.text.strip() + " "

        return clean_json_string(text_output) or hf_fallback or "Gemini produced no output."
    except Exception as e:
        logging.error(f"[Gemini API Error] {str(e)}")
        return hf_fallback or f"Gemini error: {str(e)}"

# ------------------ Summarization ------------------
def summarize_large_policy_with_gemini(prompt, text, max_tokens=1500):
    chunks = chunk_text(text)
    summaries = []

    for i, chunk in enumerate(chunks):
        hf_summary_text = fallback_summary(chunk)
        gemini_prompt = f"{prompt}\n\nPolicy Summary (Part {i+1}/{len(chunks)}):\n{hf_summary_text}"
        refined = _call_gemini(
            gemini_prompt,
            max_output_tokens=max(max_tokens, len(hf_summary_text)//2),
            hf_fallback=hf_summary_text
        )
        summaries.append(refined.strip())

    combined_summary = " ".join(summaries)
    final_prompt = (
        "Combine the following into one clear summary. "
        "Provide JSON with keys: summary, bullets, tone, risks.\n\n"
        f"{combined_summary}"
    )

    return _call_gemini(final_prompt, max_output_tokens=2000, hf_fallback=combined_summary[:500] + "...")

# ------------------ Main Entry ------------------
def ai_summarize(params: dict):
    prompt = params.get("prompt", "")
    text = params.get("text", "")
    max_tokens = params.get("max_tokens", 1500)

    if not text or len(text.strip()) < 80:
        return {"summary": "Insufficient policy text.", "bullets": [], "tone": "unknown", "risks": []}

    try:
        if len(text) > MAX_PROMPT_LENGTH:
            out_text = summarize_large_policy_with_gemini(prompt, text, max_tokens)
        else:
            hf_summary_text = fallback_summary(text)
            out_text = _call_gemini(
                f"{prompt}\n\nPolicy Summary:\n{hf_summary_text}",
                max_output_tokens=max_tokens,
                hf_fallback=hf_summary_text
            )

        out_text = clean_json_string(out_text)

        try:
            parsed = json.loads(out_text)
            bullets_list = parsed.get("bullets") or [
                s.strip() for s in parsed.get("summary", "").split(". ")[:5] if s.strip()
            ]
            return {
                "summary": parsed.get("summary", out_text),
                "bullets": bullets_list,
                "tone": parsed.get("tone", "unknown"),
                "risks": parsed.get("risks", []),
            }
        except:
            bullets_list = [s.strip() for s in out_text.split(". ")[:5] if s.strip()]
            return {"summary": out_text.strip(), "bullets": bullets_list, "tone": "unknown", "risks": []}

    except Exception as e:
        logging.exception("[AI Error]")
        return {"summary": f"AI summarization unavailable: {str(e)}", "bullets": [], "tone": "unknown", "risks": []}
