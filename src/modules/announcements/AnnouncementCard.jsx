import { Pencil, Trash2, Link as LinkIcon } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { ANNOUNCEMENT_CATEGORIES } from "../../constants/categoryStyles";

export default function AnnouncementCard({ announcement, layout = "grid", isAdmin, onEdit, onDelete }) {
  const isExpired = announcement.expiryDate && announcement.expiryDate < new Date().toISOString().slice(0, 10);

  if (layout === "list") {
    return (
      <div className={`flex items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all ${isExpired ? "opacity-60" : ""}`}>
        <div className="flex items-center gap-4 min-w-0">
          <Badge tone={ANNOUNCEMENT_CATEGORIES[announcement.category]} className="shrink-0">{announcement.category}</Badge>
          <div className="min-w-0">
            <h3 className="font-black italic text-slate-800 truncate">{announcement.title}</h3>
            <p className="text-xs text-slate-500 truncate">{announcement.content}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-slate-400">{announcement.publishDate}</span>
          <div className="flex gap-1">
            <button onClick={() => onEdit(announcement)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
              <Pencil size={14} />
            </button>
            {isAdmin && (
              <button onClick={() => onDelete(announcement)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={isExpired ? "opacity-60" : ""}>
      <div className="flex items-start justify-between mb-2">
        <Badge tone={ANNOUNCEMENT_CATEGORIES[announcement.category]}>{announcement.category}</Badge>
        <div className="flex gap-1">
          <button onClick={() => onEdit(announcement)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
            <Pencil size={14} />
          </button>
          {isAdmin && (
            <button onClick={() => onDelete(announcement)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <h3 className="font-black italic text-slate-800 mb-1">{announcement.title}</h3>
      <p className="text-sm text-slate-500 mb-3 whitespace-pre-wrap line-clamp-4">{announcement.content}</p>
      {announcement.links?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {announcement.links.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-indigo-600 font-bold">
              <LinkIcon size={11} /> {l.label || l.url}
            </a>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-400">
        發布：{announcement.publishDate}
        {announcement.expiryDate && ` · 到期：${announcement.expiryDate}`}
      </p>
    </Card>
  );
}
