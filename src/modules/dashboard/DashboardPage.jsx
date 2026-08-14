import { useMemo } from "react";
import { Megaphone, CalendarDays, MapPin } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { ANNOUNCEMENT_CATEGORIES } from "../../constants/categoryStyles";

export default function DashboardPage() {
  const { data: announcements, loading: loadingAnnouncements } = useCollection("announcements", {
    orderByField: "publishDate",
    orderByDirection: "desc",
  });
  const { data: events, loading: loadingEvents } = useCollection("events", {
    orderByField: "date",
    orderByDirection: "asc",
  });

  const today = new Date().toISOString().slice(0, 10);

  const recentAnnouncements = useMemo(() => announcements.slice(0, 5), [announcements]);
  const upcomingEvents = useMemo(
    () => events.filter((e) => e.date >= today && e.status !== "cancelled").slice(0, 5),
    [events, today]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="text-indigo-500" size={18} />
          <h3 className="font-black italic text-slate-800">最新公告</h3>
        </div>
        {loadingAnnouncements ? (
          <p className="text-sm text-slate-400 italic">載入中...</p>
        ) : recentAnnouncements.length === 0 ? (
          <EmptyState icon={Megaphone} title="還沒有公告" />
        ) : (
          <ul className="space-y-3">
            {recentAnnouncements.map((a) => (
              <li key={a.id} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge tone={ANNOUNCEMENT_CATEGORIES[a.category]}>{a.category}</Badge>
                  <span className="text-[10px] text-slate-400">{a.publishDate}</span>
                </div>
                <p className="text-sm font-bold text-slate-700">{a.title}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="text-emerald-500" size={18} />
          <h3 className="font-black italic text-slate-800">即將到來的活動</h3>
        </div>
        {loadingEvents ? (
          <p className="text-sm text-slate-400 italic">載入中...</p>
        ) : upcomingEvents.length === 0 ? (
          <EmptyState icon={CalendarDays} title="近期沒有活動" />
        ) : (
          <ul className="space-y-3">
            {upcomingEvents.map((e) => (
              <li key={e.id} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <p className="text-sm font-bold text-slate-700">{e.title}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span>{e.date}{e.startTime && ` ${e.startTime}`}</span>
                  {e.location && (
                    <span className="flex items-center gap-1"><MapPin size={10} />{e.location}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
