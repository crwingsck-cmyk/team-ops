import {
  VOLUNTEER_STATUS,
  GENDER_LABELS,
  MISSION_BODY_LABELS,
  TC_IDENTIFICATION_LABELS,
  MARITAL_STATUS_LABELS,
  WORK_SCHEDULE_LABELS,
  CAR_SEATS_LABELS,
  REGISTRATION_STATUS,
  AVAILABILITY_DAYS,
  AVAILABILITY_SLOTS,
} from "./categoryStyles";

const YES_NO = { yes: "是", no: "否" };

function enumLabel(map, value) {
  const raw = map[value];
  if (raw == null) return value || "-";
  const text = typeof raw === "string" ? raw : raw.label;
  return text ? text.split(" ")[0] : value;
}

function joinArray(value) {
  return Array.isArray(value) && value.length > 0 ? value.join("、") : "-";
}

function formatAvailability(availability) {
  if (!availability) return "-";
  const parts = AVAILABILITY_DAYS.map((day) => {
    const slots = AVAILABILITY_SLOTS.filter((slot) => availability[day.key]?.[slot.key]).map((slot) => slot.label.split(" ")[0]);
    return slots.length > 0 ? `${day.label.split(" ")[0]}(${slots.join("/")})` : null;
  }).filter(Boolean);
  return parts.length > 0 ? parts.join("、") : "-";
}

export const VOLUNTEER_REPORT_COLUMNS = [
  { key: "name", label: "姓名" },
  { key: "englishName", label: "英文名" },
  { key: "gender", label: "性別", format: (r) => enumLabel(GENDER_LABELS, r.gender) },
  { key: "age", label: "年齡" },
  { key: "phone", label: "電話" },
  { key: "email", label: "Email" },
  { key: "memberId", label: "會員編號" },
  { key: "status", label: "狀態", format: (r) => enumLabel(VOLUNTEER_STATUS, r.status) },
  { key: "tcIdentification", label: "慈濟身份", format: (r) => enumLabel(TC_IDENTIFICATION_LABELS, r.tcIdentification) },
  { key: "missionBody", label: "志業體", format: (r) => (r.missionBody === "other" ? r.missionBodyOther || "其他" : enumLabel(MISSION_BODY_LABELS, r.missionBody)) },
  { key: "heQi", label: "和氣" },
  { key: "huAi", label: "互愛" },
  { key: "xieLi", label: "協力" },
  { key: "mentorName", label: "帶動人" },
  { key: "joinDate", label: "加入日期" },
  { key: "skills", label: "專長", format: (r) => joinArray(r.skills) },
  { key: "position4in1", label: "四合一崗位", format: (r) => joinArray(r.position4in1) },
  { key: "positionOther", label: "其他崗位" },
  { key: "positionHistory", label: "崗位經歷" },
  { key: "address", label: "住址" },
  { key: "maritalStatus", label: "婚姻狀態", format: (r) => enumLabel(MARITAL_STATUS_LABELS, r.maritalStatus) },
  { key: "familyRemarks", label: "家庭狀況備註" },
  { key: "workSchedule", label: "上班時間", format: (r) => (r.workSchedule === "other" ? r.workScheduleOther || "其他" : enumLabel(WORK_SCHEDULE_LABELS, r.workSchedule)) },
  { key: "jobTitle", label: "職稱" },
  { key: "jobTenure", label: "年資（年）" },
  { key: "canDrive", label: "是否會開車", format: (r) => enumLabel(YES_NO, r.canDrive) },
  { key: "carSeats", label: "車子座位數", format: (r) => enumLabel(CAR_SEATS_LABELS, r.carSeats) },
  { key: "usesFamilyTreasure", label: "是否使用傳家寶", format: (r) => enumLabel(YES_NO, r.usesFamilyTreasure) },
  { key: "availability", label: "可服務時段", format: (r) => formatAvailability(r.availability) },
  { key: "availabilityRemarks", label: "服務時段備註" },
  { key: "goodAt1", label: "擅長事項一" },
  { key: "goodAt2", label: "擅長事項二" },
  { key: "futureInterest", label: "未來想學習/參與" },
  { key: "notes", label: "備註" },
];

export const DEFAULT_VOLUNTEER_REPORT_KEYS = ["name", "phone", "status", "tcIdentification", "heQi", "huAi", "xieLi"];

export const GUEST_REPORT_COLUMNS = [
  { key: "name", label: "姓名" },
  { key: "phone", label: "電話" },
  { key: "area", label: "居住地區" },
  { key: "tcIdentification", label: "慈濟身份", format: (g) => enumLabel(TC_IDENTIFICATION_LABELS, g.tcIdentification) },
  { key: "inviterName", label: "邀約人姓名" },
  { key: "inviterPhone", label: "邀約人電話" },
  { key: "attendedEvents", label: "參與過的活動", format: (g) => joinArray(g.attendedEvents) },
  { key: "notes", label: "備註" },
];

export const DEFAULT_GUEST_REPORT_KEYS = ["name", "phone", "area", "inviterName", "attendedEvents"];

export const ATTENDANCE_REPORT_COLUMNS = [
  { key: "name", label: "姓名" },
  { key: "phone", label: "電話" },
  { key: "category", label: "類別", format: (r) => (r.volunteerId ? "志工" : "大德") },
  { key: "tcIdentification", label: "慈濟身份", format: (r) => enumLabel(TC_IDENTIFICATION_LABELS, r.tcIdentification) },
  { key: "eventTitle", label: "活動名稱", format: (r) => r.eventTitle || "-" },
  { key: "eventDate", label: "活動日期", format: (r) => r.eventDateDisplay || r.eventDate || "-" },
  { key: "heQi", label: "和氣" },
  { key: "huAi", label: "互愛" },
  { key: "xieLi", label: "協力" },
  { key: "area", label: "地區" },
  { key: "status", label: "報名狀態", format: (r) => enumLabel(REGISTRATION_STATUS, r.status) },
  { key: "attended", label: "是否出席", format: (r) => (r.attended ? "已出席" : "未出席") },
  { key: "childrenCount", label: "報名人數（含自己本人）" },
  { key: "attendedChildrenCount", label: "實際出席人數（含自己本人）" },
  { key: "notes", label: "備註" },
];

export const DEFAULT_ATTENDANCE_REPORT_KEYS = ["name", "phone", "eventTitle", "eventDate", "status", "attended"];
