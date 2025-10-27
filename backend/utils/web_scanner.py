from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import requests
import logging
import asyncio

async def analyze_website(url: str) -> dict:
    logging.info(f"Analyzing website {url}")
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    # Try Playwright with retries
    for attempt in range(3):
        try:
            logging.info(f"Attempting Playwright for {url} (Attempt {attempt + 1})")
            logging.info(f"Current event loop: {asyncio.get_event_loop().__class__.__name__}")
            async with async_playwright() as p:
                logging.info("Playwright initialized successfully")
                browser = await p.chromium.launch(headless=False)  # Non-headless for debugging
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    extra_http_headers={
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.5",
                        "Connection": "keep-alive"
                    }
                )
                page = await context.new_page()
                logging.info(f"Navigating to {url}")
                await page.goto(url, wait_until="networkidle", timeout=60000)
                trackers = await page.evaluate("""
                    () => {
                        const trackers = Array.from(document.querySelectorAll('script[src], iframe[src], img[src]'))
                            .filter(el => !el.src.includes(location.hostname))
                            .map(el => {
                                const domain = el.src.includes('://') ? el.src.split('/')[2] : el.src;
                                let name = domain.split('.')[domain.split('.').length - 2] || domain;
                                let category = 'Unknown';
                                if (['google', 'facebook', 'doubleclick', 'ads', 'pixel'].some(k => domain.toLowerCase().includes(k))) {
                                    category = 'Analytics';
                                }
                                return { name, category, blocked: false, domain };
                            });
                        return trackers.filter((t, i, arr) => 
                            arr.findIndex(x => x.name.toLowerCase() === t.name.toLowerCase() && x.domain === t.domain) === i
                        );
                    }
                """)
                cookies = await page.context.cookies()
                headers = await page.evaluate("() => Object.fromEntries([...new Headers()])")
                security_headers = ["Content-Security-Policy", "Strict-Transport-Security", "X-Frame-Options"]
                detected_headers = {h: headers.get(h.lower(), "Missing") for h in security_headers}
                logging.info(f"Found {len(trackers)} trackers, {len(cookies)} cookies with Playwright")
                await browser.close()
                return {
                    "url": url,
                    "status": 200,
                    "security_headers": detected_headers,
                    "cookies": [c["name"] for c in cookies],
                    "trackers": trackers
                }
        except Exception as e:
            logging.exception(f"Playwright failed for {url} on attempt {attempt + 1}")
            if attempt < 2:
                logging.info("Retrying in 2 seconds...")
                await asyncio.sleep(2)
            continue
    # Fallback to requests
    try:
        logging.info(f"Attempting requests for {url}")
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        headers = response.headers
        cookies = list(response.cookies.get_dict().keys())
        security_headers = ["Content-Security-Policy", "Strict-Transport-Security", "X-Frame-Options"]
        detected_headers = {h: headers.get(h, "Missing") for h in security_headers}
        soup = BeautifulSoup(response.text, "html.parser")
        trackers = []
        seen_trackers = set()
        for script in soup.find_all("script", src=True):
            src = script["src"]
            if url not in src:
                domain = src.split("/")[2] if "://" in src else src
                name = domain.split(".")[-2].capitalize() if "." in domain else domain
                key = f"{name}:{domain}"
                if key not in seen_trackers:
                    seen_trackers.add(key)
                    category = "Analytics" if any(k in domain.lower() for k in ["google", "facebook", "doubleclick", "ads", "pixel"]) else "Unknown"
                    trackers.append({"name": name, "category": category, "blocked": False, "domain": domain})
        for iframe in soup.find_all("iframe", src=True):
            src = iframe["src"]
            if url not in src:
                domain = src.split("/")[2] if "://" in src else src
                name = domain.split(".")[-2].capitalize() if "." in domain else domain
                key = f"{name}:{domain}"
                if key not in seen_trackers:
                    seen_trackers.add(key)
                    category = "Analytics" if any(k in domain.lower() for k in ["google", "facebook", "doubleclick", "ads", "pixel"]) else "Unknown"
                    trackers.append({"name": name, "category": category, "blocked": False, "domain": domain})
        logging.info(f"Found {len(trackers)} trackers, {len(cookies)} cookies with requests")
        return {
            "url": url,
            "status": response.status_code,
            "security_headers": detected_headers,
            "cookies": cookies,
            "trackers": trackers
        }
    except Exception as e:
        logging.exception(f"Requests failed for {url}")
        return {"error": str(e), "url": url, "trackers": [], "cookies": [], "security_headers": {}}