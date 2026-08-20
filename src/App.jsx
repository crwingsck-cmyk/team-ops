import { useState } from "react";
import { LogIn, ShieldAlert } from "lucide-react";
import Shell from "./components/shell/Shell";
import { useAuth } from "./hooks/useAuth";
import { useMembership } from "./hooks/useMembership";
import EmptyState from "./components/ui/EmptyState";
import DashboardPage from "./modules/dashboard/DashboardPage";
import AnnouncementsPage from "./modules/announcements/AnnouncementsPage";
import EventsPage from "./modules/events/EventsPage";
import VolunteersPage from "./modules/volunteers/VolunteersPage";
import MeetingsPage from "./modules/meetings/MeetingsPage";
import AttendanceHistoryPage from "./modules/attendance/AttendanceHistoryPage";
import ReportsPage from "./modules/reports/ReportsPage";
import FundraisingPage from "./modules/fundraising/FundraisingPage";
import MembersPage from "./modules/members/MembersPage";

const PAGES = {
  dashboard: DashboardPage,
  announcements: AnnouncementsPage,
  events: EventsPage,
  volunteers: VolunteersPage,
  attendance: AttendanceHistoryPage,
  reports: ReportsPage,
  fundraising: FundraisingPage,
  meetings: MeetingsPage,
  members: MembersPage,
};

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading: authLoading } = useAuth();
  const { isMember, isAdmin, loading: membershipLoading } = useMembership();

  const ActivePage = PAGES[activeTab] || DashboardPage;
  const loading = authLoading || (user && membershipLoading);

  return (
    <Shell activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin}>
      {loading ? (
        <div className="text-center py-24 text-slate-400 italic">載入中...</div>
      ) : !user ? (
        <EmptyState
          icon={LogIn}
          title="請先登入"
          description="登入後即可查看與編輯團隊共用的公告、活動、志工與會議資料。"
        />
      ) : !isMember ? (
        <EmptyState
          icon={ShieldAlert}
          title="尚未取得使用權限"
          description={
            <>
              你已成功登入，但還沒有被加入允許使用的名單。請把下面這組 ID 傳給系統管理員，請他把你加進白名單：
              <br />
              <span className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-mono text-xs break-all">
                {user.uid}
              </span>
            </>
          }
        />
      ) : (
        <ActivePage />
      )}
    </Shell>
  );
}
