import { Check, X } from "lucide-react";
import { TC_IDENTIFICATION_LABELS } from "../../constants/categoryStyles";

function Field({ label, children }) {
  if (children === undefined || children === null || children === "") return null;
  return (
    <div className="py-1.5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-base text-slate-800">{children}</p>
    </div>
  );
}

export default function GuestDetail({ guest: g }) {
  const tcLabel = g.tcIdentification && TC_IDENTIFICATION_LABELS[g.tcIdentification];

  return (
    <div>
      <h3 className="font-black italic text-slate-800 text-2xl mb-2">{g.name}</h3>

      <Field label="電話">{g.phone}</Field>
      <Field label="居住地區">{g.area}</Field>
      <Field label="慈濟身份">{tcLabel}</Field>
      <Field label="備註">{g.notes}</Field>

      <div className="pt-3 border-t border-slate-100 mt-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">出席狀況</p>
        {g.attended ? (
          <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
            <Check size={16} />曾出席 {g.attendedEvents.length} 場活動
            {g.attendedEvents.length > 0 && `：${g.attendedEvents.join("、")}`}
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-slate-400">
            <X size={16} />尚未出席過任何活動
          </p>
        )}
      </div>
    </div>
  );
}
