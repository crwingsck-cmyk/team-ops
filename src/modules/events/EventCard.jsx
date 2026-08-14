import { Pencil, Trash2, MapPin, Calendar, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { EVENT_STATUS } from "../../constants/categoryStyles";

export default function EventCard({ event, registrationCount, layout = "grid", onOpen, onEdit, onDelete }) {
  if (layout === "list") {
    return (
      <div
        onClick={() => onOpen(event)}
        className="flex items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-center gap-4 min-w-0">
          <Badge tone={EVENT_STATUS[event.status]} className="shrink-0">{EVENT_STATUS[event.status]?.label}</Badge>
          <div className="min-w-0">
            <h3 className="font-black italic text-slate-800 truncate">{event.title}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1"><Calendar size={12} />{event.date}{event.startTime && ` ${event.startTime}`}</span>
              {event.location && <span className="flex items-center gap-1 truncate"><MapPin size={12} />{event.location}</span>}
              <span className="flex items-center gap-1"><Users size={12} />{registrationCount}{event.capacity ? `/${event.capacity}` : ""}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onEdit(event); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(event); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Card className="cursor-pointer" onClick={() => onOpen(event)}>
      <div className="flex items-start justify-between mb-2">
        <Badge tone={EVENT_STATUS[event.status]}>{EVENT_STATUS[event.status]?.label}</Badge>
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onEdit(event); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(event); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <h3 className="font-black italic text-slate-800 mb-2">{event.title}</h3>
      <div className="space-y-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5"><Calendar size={12} />{event.date}{event.startTime && ` ${event.startTime}`}</div>
        {event.location && <div className="flex items-center gap-1.5"><MapPin size={12} />{event.location}</div>}
        <div className="flex items-center gap-1.5">
          <Users size={12} />
          {registrationCount} 人已報名{event.capacity ? ` / 上限 ${event.capacity} 人` : ""}
        </div>
      </div>
    </Card>
  );
}
