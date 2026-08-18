export const ANNOUNCEMENT_CATEGORIES = {
  一般: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  活動: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  緊急: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  志業體: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
};

export const EVENT_STATUS = {
  draft: { label: "草稿", bg: "bg-slate-100", text: "text-slate-600" },
  published: { label: "已發布", bg: "bg-emerald-100", text: "text-emerald-700" },
  cancelled: { label: "已取消", bg: "bg-rose-100", text: "text-rose-700" },
};

export const REGISTRATION_STATUS = {
  registered: {
    label: "已報名",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    selectClass: "!bg-emerald-100 !text-emerald-700 !font-bold !border-transparent",
  },
  waitlisted: {
    label: "考慮中",
    bg: "bg-amber-100",
    text: "text-amber-700",
    selectClass: "!bg-amber-100 !text-amber-700 !font-bold !border-transparent",
  },
  cancelled: {
    label: "無法出席",
    bg: "bg-rose-100",
    text: "text-rose-700",
    selectClass: "!bg-rose-100 !text-rose-700 !font-bold !border-transparent",
  },
};

export function registrationStatusSelectClass(status) {
  return REGISTRATION_STATUS[status]?.selectClass || "";
}

export const TASK_STATUS = {
  todo: { label: "待辦", bg: "bg-slate-100", text: "text-slate-600" },
  in_progress: { label: "進行中", bg: "bg-amber-100", text: "text-amber-700" },
  done: { label: "已完成", bg: "bg-emerald-100", text: "text-emerald-700" },
};

export const ACTION_ITEM_STATUS = {
  open: { label: "待執行", bg: "bg-slate-100", text: "text-slate-600" },
  in_progress: { label: "進行中", bg: "bg-amber-100", text: "text-amber-700" },
  done: { label: "已完成", bg: "bg-emerald-100", text: "text-emerald-700" },
};

export const VOLUNTEER_STATUS = {
  active: { label: "活躍", bg: "bg-emerald-100", text: "text-emerald-700" },
  occasional: { label: "偶爾參與勤務", bg: "bg-amber-100", text: "text-amber-700" },
  environmental: { label: "環保志工", bg: "bg-teal-100", text: "text-teal-700" },
  large_events_only: { label: "只參與大型活動", bg: "bg-sky-100", text: "text-sky-700" },
  mission_only: { label: "只限參與某個志業體", bg: "bg-indigo-100", text: "text-indigo-700" },
};

export const GENDER_LABELS = {
  male: "男",
  female: "女",
};

export const MISSION_BODY_LABELS = {
  education: "教育",
  visiting: "訪視",
  jing_si_humanities: "靜思人文",
  other: "其他",
};

export const TC_IDENTIFICATION_LABELS = {
  tzu_cheng: "慈誠 Tzu-Cheng",
  commissioner: "委員 Commissioner",
  training: "培訓 PeiXun",
  trainee: "見習 Trainee",
  volunteer: "志工 Volunteer",
  zi_qing: "慈青 Tzu Ching",
  zi_shao: "慈少 Tzu Shao",
  da_de: "大德 Da De",
};

export const MARITAL_STATUS_LABELS = {
  single: "未婚 Single",
  married: "已婚 Married",
  other: "其他 Others",
};

export const WORK_SCHEDULE_LABELS = {
  mon_fri: "週一至週五上班 Monday to Friday",
  mon_sat: "週一至週六上班 Monday to Saturday",
  sat_sun: "週六&週日上班 Saturday to Sunday",
  flexible: "自由時間 Flexible working hour",
  not_working: "沒有上班 Not working",
  other: "其他",
};

export const CAR_SEATS_LABELS = {
  na: "沒有 NA",
  "5": "5人座 (5 seater)",
  "6": "6人座 (6 seater)",
  "7_8": "7至8人座 (7-8 seater)",
  "9_plus": "9人座或以上 (>9 seater)",
};

export const AVAILABILITY_DAYS = [
  { key: "mon", label: "一 Mon" },
  { key: "tue", label: "二 Tue" },
  { key: "wed", label: "三 Wed" },
  { key: "thu", label: "四 Thu" },
  { key: "fri", label: "五 Fri" },
  { key: "sat", label: "六 Sat" },
  { key: "sun", label: "日 Sun" },
];

export const AVAILABILITY_SLOTS = [
  { key: "morning", label: "早 Morning" },
  { key: "afternoon", label: "午 Afternoon" },
  { key: "night", label: "晚 Night" },
];

export const ACTIVITY_ACTION_LABELS = {
  create: "新增",
  update: "編輯",
  delete: "刪除",
  restore: "復原",
  purge: "永久刪除",
};

export const LINK_TYPE_LABELS = {
  webpage: "網頁",
  google_form: "Google 表單",
  google_drive: "Google Drive",
  youtube: "YouTube",
  zoom: "Zoom 會議",
  registration: "報名連結",
  other: "其他",
};

export const COLLECTION_LABELS = {
  announcements: "公告",
  events: "活動",
  registrations: "報名",
  volunteers: "志工",
  meetings: "會議",
  actionItems: "待辦事項",
};

export const PLEDGE_STATUS_LABELS = {
  not_yet: { label: "尚未接洽", bg: "bg-slate-100", text: "text-slate-600" },
  contacted: { label: "已接洽", bg: "bg-sky-100", text: "text-sky-700" },
  considering: { label: "考慮中", bg: "bg-amber-100", text: "text-amber-700" },
  pledged: { label: "已認捐", bg: "bg-emerald-100", text: "text-emerald-700" },
  declined: { label: "婉拒", bg: "bg-rose-100", text: "text-rose-700" },
};

export const PLEDGE_DEADLINE_LABELS = {
  "1m": "1個月",
  "3m": "3個月",
  "6m": "6個月",
  "1y": "1年",
  "2y": "2年",
};

export const DONATION_TYPE_LABELS = {
  chuyi_shiwu: "初一十五",
  xin_lian: "心蓮",
  jing_si_tang_klang: "每月繳款巴生靜思堂建設",
  rong_dong: "榮董",
  casual: "樂捐",
};
