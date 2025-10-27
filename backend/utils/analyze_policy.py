from backend.services.ai_service import ai_summarize
import logging
import json

def process_policy(policy_text: str) -> dict:
    logging.info(f"Processing policy text with {len(policy_text)} characters")
    if not policy_text:
        logging.warning("No policy text provided")
        return {"summary": "No policy text found", "bullets": [], "tone": "neutral", "risks": []}

    prompt = (
        "You are a privacy policy summarizer and analyzer. "
        "Given the following privacy policy text, produce a JSON object with exactly these keys: "
        "'summary' (a concise 3-sentence summary), "
        "'bullets' (an array of exactly 5 short bullet highlights), "
        "'tone' (one of: friendly, neutral, legalistic), "
        "'risks' (an array of high-risk clauses related to data sharing, sale, or tracking). "
        "Ensure the bullets array contains exactly 5 items, each a concise string. "
        "Return only the JSON object, with no additional text or commentary.\n\n"
        f"Privacy Policy Text:\n{policy_text}"
    )

    payload = {
        "prompt": prompt,
        "text": policy_text,
        "max_tokens": 3500  # Increased from 2000
    }

    try:
        response = ai_summarize(payload)
        logging.info(f"Raw AI summary response ({len(json.dumps(response))} characters): {json.dumps(response)[:200]}...")
        # Handle string or dict response
        if isinstance(response, str):
            response = json.loads(response)
        elif not isinstance(response, dict):
            raise ValueError(f"ai_summarize returned invalid type: {type(response)}")
        # Validate required keys and bullets length
        required_keys = {"summary", "bullets", "tone", "risks"}
        if not all(key in response for key in required_keys):
            logging.error(f"Missing required keys in response: {response}")
            return {"summary": "Error: Incomplete AI response", "bullets": [], "tone": "neutral", "risks": []}
        if not isinstance(response["bullets"], list) or len(response["bullets"]) != 5:
            logging.error(f"Invalid bullets array: {response['bullets']}")
            return {
                "summary": response.get("summary", "Error: Invalid bullets array"),
                "bullets": response.get("bullets", [])[:5] + ["Missing bullet"] * (5 - len(response.get("bullets", []))),
                "tone": response.get("tone", "neutral"),
                "risks": response.get("risks", [])
            }
        logging.info(f"Processed summary ({len(response['summary'])} characters): {response['summary'][:100]}...")
        logging.info(f"Processed bullets ({len(response['bullets'])} items): {response['bullets']}")
        return response
    except Exception as e:
        logging.exception(f"Failed to process policy: {str(e)}")
        return {"summary": f"Error processing policy: {str(e)}", "bullets": [], "tone": "neutral", "risks": []}