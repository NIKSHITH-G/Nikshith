// Fire-and-forget visitor stats (see lib/stats.js). Never blocks or throws.
export function track(type, id, extra) {
  try {
    if (typeof window === "undefined" || new URLSearchParams(window.location.search).has("debug")) return;
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id, ...extra }), keepalive: true }).catch(() => {});
  } catch {}
}

// Count each page once per browser session.
export function trackVisit(id) {
  try {
    const key = `visited:${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {}
  track("visit", id);
}
