import { loadRatios } from "./ratiosStore.js";
import { loadValuation } from "./valuationStore.js";

export async function getStatus() {
  const [valuation, ratios] = await Promise.all([loadValuation(), loadRatios()]);
  return {
    valuationAsOf: valuation?.computedAt ?? null,
    ratiosAsOf: ratios?.computedAt ?? null,
  };
}
