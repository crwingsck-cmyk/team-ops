import { Pencil, Trash2, Phone, MapPin } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { VOLUNTEER_STATUS, TC_IDENTIFICATION_LABELS } from "../../constants/categoryStyles";
import { buildMapHref, mapPlatformLabel } from "../../lib/maps";

function tcIdentificationLabel(key) {
  return TC_IDENTIFICATION_LABELS[key]?.split(" ")[0] || "";
}

function positionsText(position4in1) {
  return Array.isArray(position4in1) ? position4in1.join("、") : position4in1;
}

export default function VolunteerCard({ volunteer, isAdmin, onEdit, onDelete }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-black italic text-slate-800 text-2xl">{volunteer.name}</h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {volunteer.status && (
              <Badge tone={VOLUNTEER_STATUS[volunteer.status]}>
                {VOLUNTEER_STATUS[volunteer.status]?.label}
              </Badge>
            )}
            {volunteer.tcIdentification && (
              <Badge tone={{ bg: "bg-indigo-100", text: "text-indigo-700" }}>
                {tcIdentificationLabel(volunteer.tcIdentification)}
              </Badge>
            )}
          </div>
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
      <div className="space-y-2 text-lg text-slate-600">
        {volunteer.phone && (
          <div className="flex items-center gap-1.5"><Phone size={17} />{volunteer.phone}</div>
        )}
        {volunteer.position4in1?.length > 0 && (
          <div className="text-sm text-slate-500">承擔：{positionsText(volunteer.position4in1)}</div>
        )}
        {volunteer.mentorName && (
          <div className="text-sm text-slate-500">帶動人：{volunteer.mentorName}</div>
        )}
        {volunteer.address && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin size={15} className="shrink-0" />
            <span className="truncate">{volunteer.address}</span>
            <a
              href={buildMapHref(volunteer.address)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-indigo-600 hover:underline shrink-0"
            >
              {mapPlatformLabel(volunteer.address)}
            </a>
          </div>
        )}
        {volunteer.mapLink && (
          <a
            href={buildMapHref(volunteer.mapLink)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
          >
            <MapPin size={15} />在 {mapPlatformLabel(volunteer.mapLink)} 開啟
          </a>
        )}
      </div>
    </Card>
  );
}
