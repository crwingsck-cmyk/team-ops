import { TC_IDENTIFICATION_LABELS } from "./categoryStyles";

export const GUEST_FILTER_FIELDS = [
  { key: "area", label: "居住地區", source: "dynamic" },
  { key: "tcIdentification", label: "慈濟身份", source: "enum", enumOptions: TC_IDENTIFICATION_LABELS },
];

export const DEFAULT_GUEST_FILTER_KEYS = ["area"];

export function guestFilterOptionLabel(field, key) {
  const raw = field.enumOptions[key];
  if (typeof raw === "string") return raw.split(" ")[0];
  return raw?.label || key;
}
