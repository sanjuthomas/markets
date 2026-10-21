import { formatStamp } from "./format.js";

const STORAGE_KEY = "heatmap.apiBase";

async function resolveApiBase() {
  const fromQuery = new URLSearchParams(location.search).get("api");
  if (fromQuery) return fromQuery.trim();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored.trim();
  for (const url of ["./config.json", "../config.json"]) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;
      const config = await response.json();
      if (config.apiBase) return String(config.apiBase).trim();
    } catch {
      // The next candidate may be the site root.
    }
  }
  return "";
}

async function loadComputedAt(apiBase) {
  const base = apiBase.replace(/\/$/, "");
  for (const path of ["/api/status", "/api/heatmap"]) {
    try {
      const response = await fetch(base ? `${base}${path}` : path, { cache: "no-store" });
      if (!response.ok) continue;
      const data = await response.json();
      const stamps = [data.valuationAsOf, data.ratiosAsOf].filter(Boolean);
      if (!stamps.length) continue;
      return stamps.sort().at(-1);
    } catch {
      // Try the next endpoint.
    }
  }
  return null;
}

async function start() {
  const nodes = document.querySelectorAll("[data-asof]");
  if (!nodes.length) return;
  const computedAt = await loadComputedAt(await resolveApiBase());
  if (!computedAt) return;
  const label = `Computed ${formatStamp(computedAt)}`;
  for (const node of nodes) {
    node.textContent = label;
    node.hidden = false;
  }
}

start();
