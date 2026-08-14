import { Pencil, Trash2, Phone, Mail } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { VOLUNTEER_STATUS } from "../../constants/categoryStyles";

export default function VolunteerCard({ volunteer, isAdmin, onEdit, onDelete }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-black italic text-slate-800 text-lg">{volunteer.name}</h3>
          <Badge tone={VOLUNTEER_STATUS[volunteer.status]} className="mt-1">
            {VOLUNTEER_STATUS[volunteer.status]?.label}
          </Badge>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(volunteer)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
            <Pencil size={14} />
          </button>
          {isAdmin && (
            <button onClick={() => onDelete(volunteer)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-1.5 text-sm text-slate-600 mb-3">
        {volunteer.phone && (
          <div className="flex items-center gap-1.5"><Phone size={13} />{volunteer.phone}</div>
        )}
        {volunteer.email && (
          <div className="flex items-center gap-1.5"><Mail size={13} />{volunteer.email}</div>
        )}
      </div>
      {volunteer.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {volunteer.skills.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">{s}</span>
          ))}
        </div>
      )}
    </Card>
  );
}
