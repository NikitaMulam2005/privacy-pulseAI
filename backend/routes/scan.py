from fastapi import APIRouter
from datetime import datetime
from backend.models import ScanRequest, ScanResult, TrackerInfo
from backend.utils.policy_fetcher import fetch_policy
from backend.utils.analyze_policy import process_policy
from backend.utils.feature_extractor import extract_features
from backend.utils.score_engine import predict_risk
from backend.utils.web_scanner import analyze_website
from backend.database import save_scan_result
from backend.utils.ip_lookup import get_website_country
import logging
import re

router = APIRouter()
CACHE = {}

@router.post("/", response_model=ScanResult)
async def scan_url(request: ScanRequest):
    logging.info(f"Scanning URL: {request.url}")
    url = request.url
    if url in CACHE:
        logging.info("Returning cached result")
        return CACHE[url]

    logging.info("Running full scan...")
    try:
        # Try the provided URL
        policy_text = await fetch_policy(url)
        logging.info(f"Fetched {len(policy_text)} characters from {url}")

        # If no policy text or URL is problematic, try fallback URLs
        if not policy_text or "grok.com/c/" in url:
            logging.info(f"No policy text found for {url} or problematic URL, trying fallbacks...")
            fallbacks = [
                f"{url.rsplit('/', 1)[0]}/privacy" if '/' in url else f"{url}/privacy",
                f"{url.rsplit('/', 1)[0]}/legal" if '/' in url else f"{url}/legal",
                f"{url.rsplit('/', 1)[0]}/privacy-policy" if '/' in url else f"{url}/privacy-policy",
               
            ]
            for fb in fallbacks:
                logging.info(f"Trying fallback URL: {fb}")
                policy_text = await fetch_policy(fb)
                if policy_text:
                    logging.info(f"Fetched {len(policy_text)} characters from {fb}")
                    url = fb
                    break

        summary = process_policy(policy_text) if policy_text else {"summary": "No policy text found"}
        features = extract_features(policy_text, summary) if policy_text else {}
        risk = predict_risk(features) if features else {"classification": "Unknown", "score": 0.0}
        scan_data = await analyze_website(url)
        logging.info(f"Found {len(scan_data.get('trackers', []))} trackers")
        if "error" in scan_data:
            logging.warning(f"Web scan failed: {scan_data['error']}")
        geo_info = get_website_country(url)
        cookies_list = scan_data.get("cookies", []) if "cookies" in scan_data else []
        trackers_list = [
            TrackerInfo(
                name=t["name"],
                category=t.get("category", "Analytics"),
                blocked=t.get("blocked", False)
            )
            for t in scan_data.get("trackers", []) if "trackers" in scan_data
        ]
        result = ScanResult(
            url=url,
            summary=summary.get("summary", ""),
            classification=risk["classification"],
            score=risk["score"],
            trackers=trackers_list,
            cookies=cookies_list,
            raw_policy_text=policy_text,
            features=features
        )
        await save_scan_result({
            **result.dict(),
            "geo": geo_info,
            "created_at": datetime.utcnow()
        })
        final_result = {**result.dict(), "geo": geo_info}
        CACHE[url] = final_result
        logging.info("Scan complete")
        return final_result
    except Exception as e:
        logging.exception(f"Scan failed for {url}")
        return ScanResult(
            url=url,
            summary="Scan failed",
            classification="Unknown",
            score=0.0,
            trackers=[],
            cookies=[],
            raw_policy_text="",
            features={}
        )