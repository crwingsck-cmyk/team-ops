import { useState } from "react";
import { LogIn } from "lucide-react";
import Shell from "./components/shell/Shell";
import { useAuth } from "./hooks/useAuth";
import EmptyState from "./components/ui/EmptyState";
import DashboardPage from "./modules/dashboard/DashboardPage";
import AnnouncementsPage from "./modules/announcements/AnnouncementsPage";
import EventsPage from "./modules/events/EventsPage";
import VolunteersPage from "./modules/volunteers/VolunteersPage";
import MeetingsPage from "./modules/meetings/MeetingsPage";
import DivisionsPage from "./modules/divisions/DivisionsPage";

const PAGES = {
  dashboard: DashboardPage,
  announcements: AnnouncementsPage,
  events: EventsPage,
  volunteers: VolunteersPage,
  meetings: MeetingsPage,
  divisions: DivisionsPage,
};

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading } = useAuth();

  const ActivePage = PAGES[activeTab] || DashboardPage;

  return (
    <Shell activeTab={activeTab} onTabChange={setActiveTab}>
      {loading ? (
        <div className="text-center py-24 text-slate-400 italic">載入中...</div>
      ) : user ? (
        <ActivePage />
      ) : (
        <EmptyState
          icon={LogIn}
          title="請先登入"
          description="登入後即可查看與編輯團隊共用的活動、志工、會議與志業體資料。"
        />
      )}
    </Shell>
  );
}
