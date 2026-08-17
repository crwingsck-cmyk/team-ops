import { useMemo, useState } from "react";
import { Search, CalendarDays, Check, X, ChevronDown, ChevronUp, Plus, Pencil, Trash2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { chineseIncludes } from "../../lib/chineseSearch";
import { eventFirstDate } from "../../lib/eventDays";
import { REGISTRATION_STATUS } from "../../constants/categoryStyles";

function registrationDate(r, event) {
  return event ? eventFirstDate(event) : (r.eventDate || "");
}

export default function GuestDirectory({ registrations, events, guests: guestDocs, isAdmin, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const guests = useMemo(() => {
    const map = new Map();
    guestDocs.forEach((doc) => {
      const key = `${(doc.name || "").trim()}|${(doc.phone || "").trim()}`;
      map.set(key, { key, guestId: doc.id, name: doc.name, phone: doc.phone || "", area: doc.area || "", notes: doc.notes || "", records: [] });
    });
    registrations.forEach((r) => {
      if (r.volunteerId) return;
      const key = `${(r.name || "").trim()}|${(r.phone || r.contact || "").trim()}`;
      if (!map.has(key)) {
        map.set(key, { key, name: r.name, phone: r.phone || r.contact || "", area: "", records: [] });
      }
      const g = map.get(key);
      if (r.area && !g.area) g.area = r.area;
      g.records.push(r);
    });
    return [...map.values()].sort((a, b) => b.records.length - a.records.length);
  }, [registrations, guestDocs]);

  const filtered = useMemo(() => {
    if (!search) return guests;
    return guests.filter((g) => chineseIncludes(`${g.name} ${g.phone} ${g.area}`, search));
  }, [guests, search]);

  const toggleExpanded = (key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋大德姓名、電話或居住地區..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-lg hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          />
        </div>
        <Button icon={Plus} onClick={onAdd}>新增大德資料</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={guests.length === 0 ? "還沒有大德資料" : "找不到符合的紀錄"}
          description="點選「新增大德資料」手動建立，或透過活動報名時的「新增大德報名」登記，都會出現在這裡。"
          action={<Button icon={Plus} onClick={onAdd}>新增大德資料</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => {
            const isExpanded = expandedKeys.has(g.key);
            return (
              <Card key={g.key} className="!p-0 overflow-hidden">
                <div className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <button
                    onClick={() => toggleExpanded(g.key)}
                    className="flex-1 flex flex-wrap items-baseline gap-x-4 gap-y-1 min-w-0 text-left"
                  >
                    <span className="font-black text-xl text-slate-800 truncate">{g.name}</span>
                    <span className="text-sm text-slate-500">{g.phone || "-"}</span>
                    {g.area && <span className="text-sm text-slate-400 truncate">{g.area}</span>}
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    {g.guestId && (
                      <>
                        <button onClick={() => onEdit(g)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
                          <Pencil size={16} />
                        </button>
                        {isAdmin && (
                          <button onClick={() => onDelete(g)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                    <button onClick={() => toggleExpanded(g.key)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <ul className="space-y-2 px-5 pb-5">
                    {g.notes && (
                      <li className="p-3 rounded-xl bg-slate-50 text-sm text-slate-600 italic">備註：{g.notes}</li>
                    )}
                    {g.records.length === 0 && (
                      <li className="p-3 rounded-xl bg-slate-50 text-sm text-slate-400 italic">尚未參加任何活動</li>
                    )}
                    {g.records
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
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
