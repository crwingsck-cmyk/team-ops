import { LayoutDashboard, Megaphone, CalendarDays, Users, ClipboardList } from "lucide-react";
import Header from "./Header";
import TabNav from "./TabNav";

export const TABS = [
  { id: "dashboard", label: "首頁", icon: LayoutDashboard },
  { id: "announcements", label: "公告", icon: Megaphone },
  { id: "events", label: "活動", icon: CalendarDays },
  { id: "volunteers", label: "志工", icon: Users },
  { id: "meetings", label: "會議", icon: ClipboardList },
];

export default function Shell({ activeTab, onTabChange, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-3 py-4 xl:px-6">
        <Header />
        <TabNav tabs={TABS} activeTab={activeTab} onChange={onTabChange} />
        <main>{children}</main>
      </div>
    </div>
  );
}
