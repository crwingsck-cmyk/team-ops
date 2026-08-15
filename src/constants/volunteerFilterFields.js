import {
  VOLUNTEER_STATUS,
  TC_IDENTIFICATION_LABELS,
  MARITAL_STATUS_LABELS,
  WORK_SCHEDULE_LABELS,
  CAR_SEATS_LABELS,
  MISSION_BODY_LABELS,
} from "./categoryStyles";

const YES_NO = { yes: "是", no: "否" };

export const VOLUNTEER_FILTER_FIELDS = [
  { key: "status", label: "狀態", source: "enum", enumOptions: VOLUNTEER_STATUS },
  { key: "tcIdentification", label: "慈濟身份", source: "enum", enumOptions: TC_IDENTIFICATION_LABELS },
  { key: "position4in1", label: "四合一崗位", source: "dynamicArray" },
  { key: "maritalStatus", label: "婚姻狀態", source: "enum", enumOptions: MARITAL_STATUS_LABELS },
  { key: "workSchedule", label: "上班時間", source: "enum", enumOptions: WORK_SCHEDULE_LABELS },
  { key: "carSeats", label: "車子座位數", source: "enum", enumOptions: CAR_SEATS_LABELS },
  { key: "canDrive", label: "是否會開車", source: "enum", enumOptions: YES_NO },
  { key: "missionBody", label: "志業體", source: "enum", enumOptions: MISSION_BODY_LABELS },
  { key: "usesFamilyTreasure", label: "是否使用傳家寶", source: "enum", enumOptions: YES_NO },
  { key: "age", label: "年齡", source: "dynamic" },
  { key: "address", label: "住址", source: "dynamic" },
  { key: "jobTitle", label: "職稱", source: "dynamic" },
  { key: "heQi", label: "和氣", source: "dynamic" },
  { key: "huAi", label: "互愛", source: "dynamic" },
  { key: "xieLi", label: "協力", source: "dynamic" },
  { key: "mentorName", label: "帶動人", source: "dynamic" },
];

export const DEFAULT_VOLUNTEER_FILTER_KEYS = ["status", "tcIdentification", "position4in1"];

export function volunteerFilterOptionLabel(field, key) {
  const raw = field.enumOptions[key];
  if (typeof raw === "string") return raw.split(" ")[0];
  return raw?.label || key;
}
