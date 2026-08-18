import { useMemo, useState } from "react";
import { Eye, Pencil, Trash2, Phone, ChevronDown, ChevronUp, CalendarDays, Check, X } from "lucide-react";
import { VOLUNTEER_STATUS, TC_IDENTIFICATION_LABELS, REGISTRATION_STATUS } from "../../constants/categoryStyles";
import { eventFirstDate } from "../../lib/eventDays";

function tcIdentificationLabel(key) {
  return TC_IDENTIFICATION_LABELS[key]?.split(" ")[0] || "";
}

function positionsText(position4in1) {
  return Array.isArray(position4in1) ? position4in1.join("、") : position4in1;
}

function registrationDate(r, event) {
  return event ? eventFirstDate(event) : (r.eventDate || "");
}

export default function VolunteerListView({ volunteers, isAdmin, onView, onEdit, onDelete, registrations = [], events = [] }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const recordsByVolunteerId = useMemo(() => {
    const map = new Map();
    registrations.forEach((r) => {
      if (!r.volunteerId) return;
      if (!map.has(r.volunteerId)) map.set(r.volunteerId, []);
      map.get(r.volunteerId).push(r);
    });
    return map;
  }, [registrations]);

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
      {volunteers.map((v) => {
        const records = recordsByVolunteerId.get(v.id) || [];
        const isExpanded = expandedIds.has(v.id);
        return (
          <div key={v.id}>
            <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
              <button
                onClick={() => toggleExpanded(v.id)}
                className="flex-1 min-w-0 flex items-center gap-3 text-left"
                title="查看參與過的活動"
              >
                {isExpanded ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                <div className="flex-1 min-w-0 flex items-baseline gap-4 flex-wrap">
                  <span className="font-black italic text-slate-800 text-lg">{v.name}</span>
                  {v.phone && (
                    <span className="flex items-center gap-1 text-sm text-slate-500"><Phone size={14} />{v.phone}</span>
                  )}
                </div>
              </button>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => onView(v)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
                  <Eye size={18} />
                </button>
                <button onClick={() => onEdit(v)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
                  <Pencil size={18} />
                </button>
                {isAdmin && (
                  <button onClick={() => onDelete(v)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="px-5 pb-4 bg-slate-50/50">
                <div className="flex items-center gap-2 flex-wrap pt-3 pb-2">
                  {v.status && VOLUNTEER_STATUS[v.status] && (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${VOLUNTEER_STATUS[v.status].bg} ${VOLUNTEER_STATUS[v.status].text}`}>
                      {VOLUNTEER_STATUS[v.status].label}
                    </span>
                  )}
                  {v.tcIdentification && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700">
                      {tcIdentificationLabel(v.tcIdentification)}
                    </span>
                  )}
                  {v.position4in1?.length > 0 && (
                    <span className="text-sm text-slate-500">承擔：{positionsText(v.position4in1)}</span>
                  )}
                </div>
                {records.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-2">還沒有參加過任何活動</p>
                ) : (
                  <ul className="space-y-2 pt-2">
                    {records
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
                          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white">
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
