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
      <Field label="邀約人姓名">{g.inviterName}</Field>
      <Field label="邀約人電話">{g.inviterPhone}</Field>
      <Field label="備註">{g.notes}</Field>
    </div>
  );
}
