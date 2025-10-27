from playwright.async_api import async_playwright
import requests
from bs4 import BeautifulSoup
import logging
import asyncio

async def fetch_policy(url: str) -> str:
    logging.info(f"Fetching policy from {url}")
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
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                text = await page.evaluate("document.body.innerText")
                logging.info(f"Fetched {len(text)} characters with Playwright")
                await browser.close()
                return text
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
        soup = BeautifulSoup(response.text, "html.parser")
        text = soup.get_text(separator=" ", strip=True)
        logging.info(f"Fetched {len(text)} characters with requests")
        return text
    except Exception as e:
        logging.exception(f"Requests failed for {url}")
        return ""