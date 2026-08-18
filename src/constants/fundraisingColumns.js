import { TC_IDENTIFICATION_LABELS } from "./categoryStyles";

function enumLabel(map, value) {
  const raw = map[value];
  if (raw == null) return value || "-";
  const text = typeof raw === "string" ? raw : raw.label;
  return text ? text.split(" ")[0] : value;
}

export const FUNDRAISING_COLUMNS = [
  { key: "name", label: "姓名" },
  { key: "category", label: "類別" },
  { key: "phone", label: "電話" },
  { key: "tcIdentification", label: "慈濟身份", format: (r) => (r.tcIdentification ? enumLabel(TC_IDENTIFICATION_LABELS, r.tcIdentification) : "-") },
  { key: "heQi", label: "和氣" },
  { key: "huAi", label: "互愛" },
  { key: "xieLi", label: "協力" },
  { key: "area", label: "地區/住址" },
  { key: "notes", label: "備註" },
];

export const DEFAULT_FUNDRAISING_COLUMN_KEYS = ["name", "category", "phone", "heQi", "huAi", "xieLi"];
