import { LayoutDashboard, Megaphone, CalendarDays, Users, ClipboardList, History } from "lucide-react";
import Header from "./Header";
import TabNav from "./TabNav";

export const TABS = [
  { id: "dashboard", label: "首頁", icon: LayoutDashboard },
  { id: "announcements", label: "公告", icon: Megaphone },
  { id: "events", label: "活動", icon: CalendarDays },
  { id: "volunteers", label: "資料庫", icon: Users },
  { id: "attendance", label: "參與紀錄", icon: History },
  { id: "meetings", label: "會議", icon: ClipboardList },
];

export default function Shell({ activeTab, onTabChange, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100">
      <div className="max-w-7xl mx-auto px-3 py-4 xl:px-6">
        <Header />
        <TabNav tabs={TABS} activeTab={activeTab} onChange={onTabChange} />
        <main>{children}</main>
      </div>
    </div>
  );
}
