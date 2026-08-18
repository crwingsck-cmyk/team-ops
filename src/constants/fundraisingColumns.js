import { TC_IDENTIFICATION_LABELS, PLEDGE_STATUS_LABELS, DONATION_TYPE_LABELS } from "./categoryStyles";

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
  { key: "donors", label: "捐款者", format: (r) => (Array.isArray(r.donors) && r.donors.length > 0 ? r.donors.map((d) => d.name).filter(Boolean).join("、") : "-") },
  {
    key: "donationType",
    label: "捐款形式",
    format: (r) =>
      Array.isArray(r.donors) && r.donors.length > 0
        ? r.donors.map((d) => `${d.name || "-"}：${DONATION_TYPE_LABELS[d.donationType] || "-"}`).join("、")
        : "-",
  },
  { key: "amount", label: "募款金額", format: (r) => (r.amount ? r.amount.toLocaleString() : "-") },
  {
    key: "pledgeStatus",
    label: "認捐狀態",
    format: (r) =>
      Array.isArray(r.donors) && r.donors.length > 0
        ? r.donors.map((d) => `${d.name || "-"}：${enumLabel(PLEDGE_STATUS_LABELS, d.pledgeStatus || "not_yet")}`).join("、")
        : "-",
  },
  {
    key: "progress",
    label: "追蹤進度",
    format: (r) =>
      Array.isArray(r.donors) && r.donors.length > 0
        ? r.donors.map((d) => d.progress).filter(Boolean).join("；") || "-"
        : "-",
  },
  { key: "notes", label: "備註" },
];

export const DEFAULT_FUNDRAISING_COLUMN_KEYS = ["name", "category", "phone", "donors", "donationType", "amount", "pledgeStatus"];
