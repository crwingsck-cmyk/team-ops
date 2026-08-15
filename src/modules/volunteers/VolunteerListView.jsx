import { Pencil, Trash2, Phone } from "lucide-react";
import { VOLUNTEER_STATUS, TC_IDENTIFICATION_LABELS } from "../../constants/categoryStyles";

function tcIdentificationLabel(key) {
  return TC_IDENTIFICATION_LABELS[key]?.split(" ")[0] || "";
}

function positionsText(position4in1) {
  return Array.isArray(position4in1) ? position4in1.join("、") : position4in1;
}

export default function VolunteerListView({ volunteers, isAdmin, onEdit, onDelete }) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
      {volunteers.map((v) => (
        <div key={v.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black italic text-slate-800 text-lg">{v.name}</span>
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
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
              {v.phone && (
                <span className="flex items-center gap-1"><Phone size={14} />{v.phone}</span>
              )}
              {v.position4in1?.length > 0 && <span>承擔：{positionsText(v.position4in1)}</span>}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
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
      ))}
    </div>
  );
}
