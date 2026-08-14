import { Pencil, Trash2, MapPin, Calendar, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { EVENT_STATUS } from "../../constants/categoryStyles";

export default function EventCard({ event, registrationCount, divisionName, onOpen, onEdit, onDelete }) {
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
      {divisionName && (
        <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">{divisionName}</span>
      )}
    </Card>
  );
}
