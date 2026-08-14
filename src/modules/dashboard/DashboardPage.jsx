import { useMemo } from "react";
import { Megaphone, CalendarDays, MapPin, Activity } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { ANNOUNCEMENT_CATEGORIES, ACTIVITY_ACTION_LABELS, COLLECTION_LABELS } from "../../constants/categoryStyles";
import { formatRelativeTime } from "../../lib/time";

export default function DashboardPage() {
  const { data: announcements, loading: loadingAnnouncements } = useCollection("announcements", {
    orderByField: "publishDate",
    orderByDirection: "desc",
  });
  const { data: events, loading: loadingEvents } = useCollection("events", {
    orderByField: "date",
    orderByDirection: "asc",
  });
  const { data: activityLog, loading: loadingActivity } = useCollection("activityLog", {
    orderByField: "at",
    orderByDirection: "desc",
  });

  const today = new Date().toISOString().slice(0, 10);

  const recentAnnouncements = useMemo(() => announcements.slice(0, 5), [announcements]);
  const upcomingEvents = useMemo(
    () => events.filter((e) => e.date >= today && e.status !== "cancelled").slice(0, 5),
    [events, today]
  );
  const recentActivity = useMemo(() => activityLog.slice(0, 12), [activityLog]);

  return (
    <div className="space-y-6">
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

    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-amber-500" size={18} />
        <h3 className="font-black italic text-slate-800">近期活動紀錄</h3>
      </div>
      {loadingActivity ? (
        <p className="text-sm text-slate-400 italic">載入中...</p>
      ) : recentActivity.length === 0 ? (
        <EmptyState icon={Activity} title="還沒有任何操作紀錄" />
      ) : (
        <ul className="space-y-2">
          {recentActivity.map((log) => (
            <li key={log.id} className="flex items-center justify-between gap-3 text-sm py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-slate-600 truncate">
                <span className="font-bold text-slate-800">{log.userName}</span>
                {" "}{ACTIVITY_ACTION_LABELS[log.action] || log.action}
                {"了"}
                <span className="text-slate-400">{COLLECTION_LABELS[log.collectionName] || log.collectionName}</span>
                {"「"}{log.label}{"」"}
              </span>
              <span className="text-[10px] text-slate-400 shrink-0">{formatRelativeTime(log.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
    </div>
  );
}
