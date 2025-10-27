(async function() {
  try {
    // Wait for dynamic content to load (up to 5 seconds)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Find privacy link
    const anchors = Array.from(document.querySelectorAll("a"));
    const privacyAnchor = anchors.find(a => {
      const text = (a.textContent || "").toLowerCase();
      return text.includes("privacy") || text.includes("legal") || text.includes("policy");
    });
    let policyUrl = privacyAnchor ? privacyAnchor.href : null;

    // Override for grok.com session URLs
    if (policyUrl && /grok\.com\/c\//.test(policyUrl)) {
      console.warn(`Session-specific URL detected: ${policyUrl}, using fallback https://x.ai/legal`);
      policyUrl = "https://x.ai/legal";
    }
    // Override for flipkart.com
    if (policyUrl && /flipkart\.com/.test(policyUrl)) {
      console.log(`Flipkart URL detected: ${policyUrl}, using https://www.flipkart.com/pages/privacypolicy`);
      policyUrl = "https://www.flipkart.com/pages/privacypolicy";
    }
    if (!policyUrl) {
      console.warn("No privacy policy link found on page");
      chrome.storage.local.set({ last_privacypulse_summary: { error: "No privacy policy link found", trackers: [], cookies: [] } });
      return;
    }
    console.log(`Using privacy policy URL: ${policyUrl}`);

    // Fetch backend AI summary
    const backend = "http://54.149.111.177";
    let summary = {};
    try {
      const res = await fetch(`${backend}/api/scan/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: policyUrl })
      });
      if (!res.ok) {
        throw new Error(`Backend request failed with status ${res.status}`);
      }
      summary = await res.json();
      console.log("Backend scan result:", JSON.stringify(summary, null, 2));
    } catch (e) {
      console.error("Failed to fetch backend scan:", e.message);
      summary = { url: policyUrl, summary: "Backend scan failed", trackers: [], cookies: [], classification: "Unknown", score: 0.0 };
    }

    // Detect trackers on page
    const trackerList = [];
    const seenTrackers = new Set();
    const pageHostname = location.hostname.toLowerCase();

    // Helper to process elements
    function processElement(el, tag) {
      if (!el.src || el.src.includes(pageHostname)) return;
      const domain = getDomain(el.src);
      if (!domain) return;
      const name = getTrackerName(el.src, domain);
      if (!name) return;
      const key = `${name}:${domain}`;
      if (seenTrackers.has(key)) return;
      seenTrackers.add(key);
      const category = ['google', 'facebook', 'doubleclick', 'ads', 'pixel'].some(k => domain.toLowerCase().includes(k)) ? "Analytics" : "Unknown";
      trackerList.push({ name, category, blocked: false, source: tag, domain });
    }

    // Scripts
    Array.from(document.querySelectorAll("script[src]")).forEach(s => processElement(s, "script"));
    // Iframes
    Array.from(document.querySelectorAll("iframe[src]")).forEach(f => processElement(f, "iframe"));
    // Images
    Array.from(document.querySelectorAll("img[src]")).forEach(i => processElement(i, "img"));

    // Merge trackers, avoiding duplicates
    const existingTrackers = (summary.trackers || []).map(t => `${t.name.toLowerCase()}:${t.domain || t.name.toLowerCase()}`);
    const uniqueTrackers = trackerList.filter(t => !existingTrackers.includes(`${t.name.toLowerCase()}:${t.domain.toLowerCase()}`));
    summary.trackers = [...(summary.trackers || []), ...uniqueTrackers];

    // Log unique trackers
    console.log(`Frontend detected ${uniqueTrackers.length} unique trackers:`);
    uniqueTrackers.forEach(t => console.log(`- ${t.name} (${t.category}, ${t.source}, ${t.domain})`));
    console.log(`Total trackers: ${summary.trackers.length}`);

    // Save updated summary
    chrome.storage.local.set({ last_privacypulse_summary: summary }, () => {
      console.log("Saved updated summary:", JSON.stringify(summary, null, 2));
    });

  } catch (e) {
    console.error("Content script error:", e);
    chrome.storage.local.set({ last_privacypulse_summary: { error: e.message, trackers: [], cookies: [] } });
  }

  // Helper: extract domain from URL
  function getDomain(url) {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      if (!hostname || hostname === location.hostname.toLowerCase()) return null;
      return hostname;
    } catch {
      const parts = url.split("/");
      const hostname = parts[2]?.toLowerCase();
      if (!hostname || hostname === location.hostname.toLowerCase()) return null;
      return hostname;
    }
  }

  // Helper: extract readable tracker name
  function getTrackerName(url, domain) {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      const base = hostname.replace("www.", "").split(".")[0];
      if (base === location.hostname.toLowerCase().replace("www.", "").split(".")[0]) return null;
      return base || "unknown";
    } catch {
      const parts = url.split("/");
      const lastPart = parts[parts.length - 1]?.split("?")[0];
      return lastPart && !lastPart.includes(domain) ? lastPart : domain.split(".")[0] || "unknown";
    }
  }
})();