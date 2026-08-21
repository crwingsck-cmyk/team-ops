import { TC_IDENTIFICATION_LABELS, PLEDGE_STATUS_LABELS, DONATION_TYPE_LABELS, DONATION_FREQUENCY_LABELS } from "./categoryStyles";

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
  { key: "pledgeTarget", label: "目標人數", format: (r) => (r.pledgeTarget !== "" && r.pledgeTarget != null ? r.pledgeTarget : "-") },
  { key: "enteredBy", label: "輸入者", format: (r) => r.enteredBy || "-" },
  { key: "donorName", label: "捐款者", format: (r) => r.donorName || "-" },
  { key: "donorDate", label: "捐款日期", format: (r) => r.donorDate || "-" },
  { key: "donationType", label: "捐款形式", format: (r) => (r.donationType ? DONATION_TYPE_LABELS[r.donationType] || "-" : "-") },
  { key: "donorFrequency", label: "捐款頻率", format: (r) => (r.donorFrequency ? DONATION_FREQUENCY_LABELS[r.donorFrequency] || "-" : "-") },
  { key: "donorAmount", label: "募款金額", format: (r) => (r.donorAmount ? r.donorAmount.toLocaleString() : "-") },
  { key: "donorPledgeStatus", label: "認捐狀態", format: (r) => (r.donorName ? enumLabel(PLEDGE_STATUS_LABELS, r.donorPledgeStatus || "not_yet") : "-") },
  { key: "donorProgress", label: "追蹤進度", format: (r) => r.donorProgress || "-" },
  { key: "notes", label: "備註" },
];

export const DEFAULT_FUNDRAISING_COLUMN_KEYS = ["name", "category", "phone", "pledgeTarget", "donorName", "donorDate", "donationType", "donorAmount", "donorPledgeStatus"];

// Fundraising records are per-person (one record with many donors). Reports/exports
// show one row per donor instead of mashing every donor into a single joined cell,
// so a person with N donors becomes N rows (or 1 placeholder row if they have none yet).
export function flattenDonorRows(people) {
  return people.flatMap((p) => {
    if (!p.donors || p.donors.length === 0) {
      return [{ ...p, key: p.id }];
    }
    return p.donors.map((d, i) => ({
      ...p,
      // pledgeTarget is a per-record number that gets summed in exports — only
      // keep it on the first donor row so it isn't multiplied by donor count.
      // enteredBy is just a label (nothing sums it), so it stays on every row
      // via the `...p` spread above — that's what makes per-row filtering by
      // 輸入者 work for every donor, not just the first.
      pledgeTarget: i === 0 ? p.pledgeTarget : "",
      // A donor can carry its own 和氣/互愛/協力 tag (used for the "未指定志工"
      // placeholder, whose donors don't share one group) — falls back to the
      // person's own value for everyone else.
      heQi: d.heQi || p.heQi,
      huAi: d.huAi || p.huAi,
      xieLi: d.xieLi || p.xieLi,
      key: `${p.id}-${i}`,
      donorName: d.name,
      donorDate: d.date,
      donationType: d.donationType,
      donorFrequency: d.frequency,
      donorAmount: Number(d.amount) || 0,
      donorPledgeStatus: d.pledgeStatus,
      donorProgress: d.progress,
    }));
  });
}
