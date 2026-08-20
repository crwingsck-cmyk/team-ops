import { useMemo, useState } from "react";
import { Megaphone, CalendarDays, MapPin, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useMembership } from "../../hooks/useMembership";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { ANNOUNCEMENT_CATEGORIES, ACTIVITY_ACTION_LABELS, COLLECTION_LABELS } from "../../constants/categoryStyles";
import { formatRelativeTime } from "../../lib/time";
import { getDays, dateRangeText, sameLocationForAllDays } from "../../lib/eventDays";

export default function DashboardPage() {
  const [showActivity, setShowActivity] = useState(false);
  const { isAdmin } = useMembership();

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
    enabled: isAdmin,
  });

  const today = new Date().toISOString().slice(0, 10);

  const recentAnnouncements = useMemo(() => announcements.slice(0, 5), [announcements]);
  const upcomingEvents = useMemo(
    () => events.filter((e) => (e.endDate || e.date) >= today && e.status !== "cancelled").slice(0, 5),
    [events, today]
  );
  const recentActivity = useMemo(() => activityLog.slice(0, 12), [activityLog]);

  return (
    <div className="space-y-6">
    {isAdmin && (
      <Card>
        <button
          onClick={() => setShowActivity((v) => !v)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <Activity className="text-amber-500" size={18} />
            <h3 className="font-black italic text-slate-800 text-xl">近期活動紀錄</h3>
          </div>
          {showActivity ? <ChevronUp className="text-slate-400" size={20} /> : <ChevronDown className="text-slate-400" size={20} />}
        </button>
        {showActivity && (
          <div className="mt-4">
            {loadingActivity ? (
              <p className="text-base text-slate-400 italic">載入中...</p>
            ) : recentActivity.length === 0 ? (
              <EmptyState icon={Activity} title="還沒有任何操作紀錄" />
            ) : (
              <ul className="space-y-3">
                {recentActivity.map((log) => (
                  <li key={log.id} className="flex items-center justify-between gap-3 text-base py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700 truncate">
                      <span className="font-bold text-slate-800">{log.userName}</span>
                      {" "}{ACTIVITY_ACTION_LABELS[log.action] || log.action}
                      {"了"}
                      <span className="text-slate-500">{COLLECTION_LABELS[log.collectionName] || log.collectionName}</span>
                      {"「"}{log.label}{"」"}
                    </span>
                    <span className="text-sm text-slate-400 shrink-0">{formatRelativeTime(log.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="text-indigo-500" size={18} />
          <h3 className="font-black italic text-slate-800 text-xl">最新公告</h3>
        </div>
        {loadingAnnouncements ? (
          <p className="text-base text-slate-400 italic">載入中...</p>
        ) : recentAnnouncements.length === 0 ? (
          <EmptyState icon={Megaphone} title="還沒有公告" />
        ) : (
          <ul className="space-y-4">
            {recentAnnouncements.map((a) => (
              <li key={a.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge tone={ANNOUNCEMENT_CATEGORIES[a.category]}>{a.category}</Badge>
                  <span className="text-sm text-slate-500">{a.publishDate}</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{a.title}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="text-emerald-500" size={18} />
          <h3 className="font-black italic text-slate-800 text-xl">即將到來的活動</h3>
        </div>
        {loadingEvents ? (
          <p className="text-base text-slate-400 italic">載入中...</p>
        ) : upcomingEvents.length === 0 ? (
          <EmptyState icon={CalendarDays} title="近期沒有活動" />
        ) : (
          <ul className="space-y-4">
            {upcomingEvents.map((e) => {
              const days = getDays(e);
              const commonLocation = sameLocationForAllDays(days);
              const locationText = commonLocation !== null ? commonLocation : (days.length > 1 ? "多個地點" : "");
              return (
                <li key={e.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <p className="text-xl font-bold text-slate-800">{e.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1.5">
                    <span className="whitespace-nowrap">{dateRangeText(e)}{days.length === 1 && days[0]?.startTime && ` ${days[0].startTime}`}</span>
                    {locationText && (
                      <span className="flex items-center gap-1 truncate"><MapPin size={14} />{locationText}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
    </div>
  );
}
