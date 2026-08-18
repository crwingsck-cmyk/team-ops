import { TC_IDENTIFICATION_LABELS } from "./categoryStyles";

const YES_NO = { yes: "是", no: "否" };

export const GUEST_FILTER_FIELDS = [
  { key: "area", label: "居住地區", source: "dynamic" },
  { key: "tcIdentification", label: "慈濟身份", source: "enum", enumOptions: TC_IDENTIFICATION_LABELS },
  { key: "attended", label: "是否曾出席活動", source: "enum", enumOptions: YES_NO },
];

export const DEFAULT_GUEST_FILTER_KEYS = ["area"];

export function guestFilterOptionLabel(field, key) {
  const raw = field.enumOptions[key];
  if (typeof raw === "string") return raw.split(" ")[0];
  return raw?.label || key;
}
