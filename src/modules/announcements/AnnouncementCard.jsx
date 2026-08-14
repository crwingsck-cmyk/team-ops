import { Pencil, Trash2, Link as LinkIcon, HardDrive, Youtube, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { ANNOUNCEMENT_CATEGORIES } from "../../constants/categoryStyles";

const LINK_TYPE_ICONS = {
  webpage: LinkIcon,
  google_drive: HardDrive,
  youtube: Youtube,
  other: LinkIcon,
};

function LinkPill({ link }) {
  const Icon = LINK_TYPE_ICONS[link.type] || LinkIcon;
  return (
    <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-lg text-indigo-600 font-bold">
      <Icon size={18} /> {link.label || link.url}
    </a>
  );
}

export default function AnnouncementCard({ announcement, layout = "grid", isAdmin, onEdit, onDelete }) {
  const isExpired = announcement.expiryDate && announcement.expiryDate < new Date().toISOString().slice(0, 10);

  if (layout === "list") {
    return (
      <div className={`flex items-center justify-between gap-4 bg-white/80 backdrop-blur-md px-5 py-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 ${isExpired ? "opacity-60" : ""}`}>
        <div className="flex items-center gap-4 min-w-0">
          <Badge tone={ANNOUNCEMENT_CATEGORIES[announcement.category]} className="shrink-0">{announcement.category}</Badge>
          <div className="min-w-0">
            <h3 className="font-black italic text-slate-800 text-xl truncate">{announcement.title}</h3>
            <p className="text-lg text-slate-600 truncate">{announcement.content}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-base text-slate-500">{announcement.publishDate}</span>
          <div className="flex gap-1">
            <button onClick={() => onEdit(announcement)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
              <Pencil size={18} />
            </button>
            {isAdmin && (
              <button onClick={() => onDelete(announcement)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={isExpired ? "opacity-60" : ""}>
      <div className="flex items-start justify-between mb-3">
        <Badge tone={ANNOUNCEMENT_CATEGORIES[announcement.category]}>{announcement.category}</Badge>
        <div className="flex gap-1">
          <button onClick={() => onEdit(announcement)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
            <Pencil size={18} />
          </button>
          {isAdmin && (
            <button onClick={() => onDelete(announcement)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
      <h3 className="font-black italic text-slate-800 text-2xl mb-2">{announcement.title}</h3>
      {announcement.audience && (
        <p className="flex items-center gap-1.5 text-base text-slate-500 font-bold mb-3">
          <Users size={16} /> 發布對象：{announcement.audience}
        </p>
      )}
      <p className="text-lg text-slate-600 mb-4 whitespace-pre-wrap line-clamp-4">{announcement.content}</p>
      {announcement.links?.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-3">
          {announcement.links.map((l, i) => (
            <LinkPill key={i} link={l} />
          ))}
        </div>
      )}
      <p className="text-base text-slate-500">
        發布：{announcement.publishDate}
        {announcement.expiryDate && ` · 到期：${announcement.expiryDate}`}
      </p>
    </Card>
  );
}
