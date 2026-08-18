import { Pencil, Trash2, MapPin, Calendar, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import LinkPill from "../../components/ui/LinkPill";
import { EVENT_STATUS } from "../../constants/categoryStyles";
import { getDays, dateRangeText, sameLocationForAllDays } from "../../lib/eventDays";

export default function EventCard({ event, registrationCount, layout = "grid", isAdmin, onOpen, onEdit, onDelete }) {
  const days = getDays(event);
  const dateText = dateRangeText(event);
  const commonLocation = sameLocationForAllDays(days);
  const locationText = commonLocation !== null ? commonLocation : (days.length > 1 ? "多個地點" : "");
  const firstDay = days[0] || {};

  if (layout === "list") {
    return (
      <div
        onClick={() => onOpen(event)}
        className="flex items-center justify-between gap-4 bg-white/80 backdrop-blur-md px-5 py-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-4 min-w-0">
          {event.posterUrl && (
            <img src={event.posterUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
          )}
          <Badge tone={EVENT_STATUS[event.status]} className="shrink-0">{EVENT_STATUS[event.status]?.label}</Badge>
          <div className="min-w-0">
            <h3 className="font-black italic text-slate-800 text-xl truncate">{event.title}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-slate-600 mt-1">
              <span className="flex items-center gap-1 whitespace-nowrap"><Calendar size={16} />{dateText}{days.length === 1 && firstDay.startTime && ` ${firstDay.startTime}`}</span>
              {locationText && <span className="flex items-center gap-1 truncate"><MapPin size={16} />{locationText}</span>}
              <span className="flex items-center gap-1 whitespace-nowrap"><Users size={16} />{registrationCount}{event.capacity ? `/${event.capacity}` : ""}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onEdit(event); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
            <Pencil size={18} />
          </button>
          {isAdmin && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(event); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="cursor-pointer" onClick={() => onOpen(event)}>
      <div className="flex items-start justify-between mb-3">
        <Badge tone={EVENT_STATUS[event.status]}>{EVENT_STATUS[event.status]?.label}</Badge>
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onEdit(event); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
            <Pencil size={18} />
          </button>
          {isAdmin && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(event); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
      {event.posterUrl && (
        <img src={event.posterUrl} alt="" className="w-full max-h-56 object-contain bg-slate-100 rounded-2xl mb-3" />
      )}
      <h3 className="font-black italic text-slate-800 text-2xl mb-3">{event.title}</h3>
      <div className="space-y-2 text-lg text-slate-600">
        <div className="flex items-center gap-1.5"><Calendar size={17} />{dateText}{days.length === 1 && firstDay.startTime && ` ${firstDay.startTime}`}</div>
        {locationText && <div className="flex items-center gap-1.5"><MapPin size={17} />{locationText}</div>}
        <div className="flex items-center gap-1.5">
          <Users size={17} />
          {registrationCount} 人已報名{event.capacity ? ` / 上限 ${event.capacity} 人` : ""}
        </div>
      </div>
      {event.links?.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4">
          {event.links.map((l, i) => (
            <LinkPill key={i} link={l} />
          ))}
        </div>
      )}
    </Card>
  );
}
