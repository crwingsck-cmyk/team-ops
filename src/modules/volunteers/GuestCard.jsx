import { Eye, Pencil, Trash2, Phone, MapPin, Check } from "lucide-react";
import Card from "../../components/ui/Card";

export default function GuestCard({ guest: g, isAdmin, onView, onEdit, onDelete }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-black italic text-slate-800 text-2xl truncate">{g.name}</h3>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onView(g)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
            <Eye size={18} />
          </button>
          <button onClick={() => onEdit(g)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
            <Pencil size={18} />
          </button>
          {isAdmin && (
            <button onClick={() => onDelete(g)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2 text-lg text-slate-600">
        {g.phone && (
          <div className="flex items-center gap-1.5"><Phone size={17} />{g.phone}</div>
        )}
        {g.area && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={15} className="shrink-0" /><span className="truncate">{g.area}</span></div>
        )}
        {g.records.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Check size={15} className="shrink-0" />曾參加 {g.records.length} 場活動
          </div>
        )}
      </div>
    </Card>
  );
}
