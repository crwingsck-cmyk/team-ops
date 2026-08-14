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
  registered: { label: "已報名", bg: "bg-emerald-100", text: "text-emerald-700" },
  waitlisted: { label: "候補", bg: "bg-amber-100", text: "text-amber-700" },
  cancelled: { label: "已取消", bg: "bg-rose-100", text: "text-rose-700" },
};

export const TASK_STATUS = {
  todo: { label: "待辦", bg: "bg-slate-100", text: "text-slate-600" },
  in_progress: { label: "進行中", bg: "bg-amber-100", text: "text-amber-700" },
  done: { label: "已完成", bg: "bg-emerald-100", text: "text-emerald-700" },
};

export const ACTION_ITEM_STATUS = {
  open: { label: "待處理", bg: "bg-slate-100", text: "text-slate-600" },
  in_progress: { label: "進行中", bg: "bg-amber-100", text: "text-amber-700" },
  done: { label: "已完成", bg: "bg-emerald-100", text: "text-emerald-700" },
};

export const VOLUNTEER_STATUS = {
  active: { label: "在職", bg: "bg-emerald-100", text: "text-emerald-700" },
  inactive: { label: "非在職", bg: "bg-slate-100", text: "text-slate-500" },
};
