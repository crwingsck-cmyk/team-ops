import { Pencil, Trash2, Phone, Mail } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { VOLUNTEER_STATUS } from "../../constants/categoryStyles";

export default function VolunteerCard({ volunteer, isAdmin, onEdit, onDelete }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-black italic text-slate-800 text-2xl">{volunteer.name}</h3>
          <Badge tone={VOLUNTEER_STATUS[volunteer.status]} className="mt-2">
            {VOLUNTEER_STATUS[volunteer.status]?.label}
          </Badge>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(volunteer)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
            <Pencil size={18} />
          </button>
          {isAdmin && (
            <button onClick={() => onDelete(volunteer)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2 text-lg text-slate-600 mb-4">
        {volunteer.phone && (
          <div className="flex items-center gap-1.5"><Phone size={17} />{volunteer.phone}</div>
        )}
        {volunteer.email && (
          <div className="flex items-center gap-1.5"><Mail size={17} />{volunteer.email}</div>
        )}
      </div>
      {volunteer.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {volunteer.skills.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-bold">{s}</span>
          ))}
        </div>
      )}
    </Card>
  );
}
