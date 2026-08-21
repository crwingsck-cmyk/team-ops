import { PLEDGE_STATUS_LABELS, DONATION_TYPE_LABELS, TC_IDENTIFICATION_LABELS } from "./categoryStyles";
import { volunteerFilterOptionLabel } from "./volunteerFilterFields";

export const FUNDRAISING_FILTER_FIELDS = [
  { key: "heQi", label: "和氣", source: "dynamic" },
  { key: "huAi", label: "互愛", source: "dynamic" },
  { key: "xieLi", label: "協力", source: "dynamic" },
  { key: "donorPledgeStatus", label: "認捐狀態", source: "enum", enumOptions: PLEDGE_STATUS_LABELS },
  { key: "donationType", label: "捐款形式", source: "enum", enumOptions: DONATION_TYPE_LABELS },
  { key: "enteredBy", label: "輸入者", source: "dynamic" },
  { key: "tcIdentification", label: "慈濟身份", source: "enum", enumOptions: TC_IDENTIFICATION_LABELS },
];

export const DEFAULT_FUNDRAISING_FILTER_KEYS = ["heQi", "huAi", "xieLi"];

export const fundraisingFilterOptionLabel = volunteerFilterOptionLabel;
