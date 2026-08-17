import { useMemo, useState } from "react";
import { Search, CalendarDays, Check, X } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { chineseIncludes } from "../../lib/chineseSearch";
import { eventFirstDate } from "../../lib/eventDays";
import { REGISTRATION_STATUS } from "../../constants/categoryStyles";

function registrationDate(r, event) {
  return event ? eventFirstDate(event) : (r.eventDate || "");
}

export default function AttendanceHistoryPage() {
  const { data: registrations, loading: loadingRegs } = useCollection("registrations");
  const { data: events, loading: loadingEvents } = useCollection("events");
  const [search, setSearch] = useState("");

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const people = useMemo(() => {
    const map = new Map();
    registrations.forEach((r) => {
      const key = r.volunteerId
        ? `v:${r.volunteerId}`
        : `g:${(r.name || "").trim()}|${(r.phone || r.contact || "").trim()}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: r.name,
          phone: r.phone || r.contact || "",
          isVolunteer: !!r.volunteerId,
          records: [],
        });
      }
      map.get(key).records.push(r);
    });
    return [...map.values()];
  }, [registrations]);

  const filteredPeople = useMemo(() => {
    if (!search) return [];
    return people
      .filter((p) => chineseIncludes(`${p.name} ${p.phone}`, search))
      .sort((a, b) => b.records.length - a.records.length);
  }, [people, search]);

  const loading = loadingRegs || loadingEvents;

  return (
    <div>
      <h2 className="text-2xl font-black italic text-slate-800 mb-4">參與紀錄查詢</h2>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="輸入姓名或電話，查詢志工或大德過去參與過的活動..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-lg hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400 italic">載入中...</div>
      ) : !search ? (
        <EmptyState icon={Search} title="輸入姓名或電話開始查詢" description="可查詢志工與大德過去報名、出席過的所有活動。" />
      ) : filteredPeople.length === 0 ? (
        <EmptyState icon={Search} title="找不到符合的紀錄" />
      ) : (
        <div className="space-y-4">
          {filteredPeople.map((p) => (
            <Card key={p.key}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-black text-xl text-slate-800">{p.name}</span>
                  <span className="ml-2 text-sm text-slate-400">{p.phone || "-"}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${p.isVolunteer ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}>
                  {p.isVolunteer ? "志工" : "大德"}
                </span>
              </div>
              <ul className="space-y-2">
                {p.records
                  .slice()
                  .sort((a, b) =>
                    registrationDate(b, eventsById.get(b.eventId)).localeCompare(registrationDate(a, eventsById.get(a.eventId)))
                  )
                  .map((r) => {
                    const event = eventsById.get(r.eventId);
                    const statusInfo = REGISTRATION_STATUS[r.status];
                    const title = event?.title || r.eventTitle || "（活動已刪除）";
                    const date = registrationDate(r, event);
                    return (
                      <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50">
                        <div className="flex items-center gap-2 min-w-0">
                          <CalendarDays size={16} className="text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-700 truncate">{title}</span>
                          {date && <span className="text-xs text-slate-400 shrink-0">{date}</span>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {statusInfo && (
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</span>
                          )}
                          {r.attended ? (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white">
                              <Check size={12} /> 已出席
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-400">
                              <X size={12} /> 未出席
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
