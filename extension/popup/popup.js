chrome.storage.local.get("last_privacypulse_summary", (data) => {
  if (!data || !data.last_privacypulse_summary) {
    document.getElementById("summary").textContent = "No scan performed yet.";
    return;
  }

  const info = data.last_privacypulse_summary;

  document.getElementById("site").textContent = info.url || "Unknown";
  document.getElementById("summary").textContent = info.summary?.summary || info.summary || "No summary";

  // Score coloring
  const scoreEl = document.getElementById("score");
  const score = info.score ?? 50;
  scoreEl.textContent = score;
  if (score <= 25) scoreEl.classList.add("low");
  else if (score <= 60) scoreEl.classList.add("medium");
  else scoreEl.classList.add("high");

  // Trackers
  const trackersUl = document.getElementById("trackers");
  trackersUl.innerHTML = "";
  (info.trackers || []).forEach(t => {
    trackersUl.innerHTML += `<li>${t.name || t}</li>`;
  });
  if (!info.trackers?.length) trackersUl.innerHTML = "<li>No trackers found ✅</li>";

  // Cookies
  const cookieUl = document.getElementById("cookies");
  cookieUl.innerHTML = "";
  (info.cookies || []).forEach(c => {
    cookieUl.innerHTML += `<li>${c}</li>`;
  });
  if (!info.cookies?.length) cookieUl.innerHTML = "<li>No cookies listed</li>";
});
