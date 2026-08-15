export function buildMapHref(address) {
  const trimmed = address.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export function mapPlatformLabel(value) {
  const v = value.trim().toLowerCase();
  if (v.includes("waze.com") || v.startsWith("waze:")) return "Waze";
  return "Google Map";
}
