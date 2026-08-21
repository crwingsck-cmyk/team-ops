import { DONATION_TYPE_LABELS, DONATION_FREQUENCY_LABELS, PLEDGE_STATUS_LABELS } from "../../constants/categoryStyles";

function Field({ label, children }) {
  if (children === undefined || children === null || children === "") return null;
  return (
    <div className="py-1.5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-base text-slate-800">{children}</p>
    </div>
  );
}

export default function FundraisingDetail({ person: p }) {
  const donors = p.donors || [];
  const total = donors.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <div>
      <h3 className="font-black italic text-slate-800 text-2xl mb-2">{p.name}</h3>

      <div className="grid grid-cols-2 gap-x-4">
        <Field label="電話">{p.phone}</Field>
        <Field label="類別">{p.category}</Field>
        <Field label="和氣">{p.heQi}</Field>
        <Field label="互愛">{p.huAi}</Field>
        <Field label="協力">{p.xieLi}</Field>
        <Field label="地區/住址">{p.area}</Field>
      </div>

      <div className="grid grid-cols-3 gap-x-4 pt-3 border-t border-slate-100 mt-3">
        <Field label="目標人數">{p.pledgeTarget !== "" && p.pledgeTarget != null ? `${p.pledgeTarget} 人` : ""}</Field>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">捐款者</p>
          <p className="text-sm font-black text-indigo-600">總計 {total.toLocaleString()}</p>
        </div>
        {donors.length === 0 ? (
          <p className="text-sm text-slate-400 italic">尚未記錄任何捐款者。</p>
        ) : (
          <div className="space-y-2">
            {donors.map((d, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800">{d.name || "-"}</p>
                  <p className="font-black text-slate-800">{(Number(d.amount) || 0).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-slate-500">
                  {d.date && <span>日期：{d.date}</span>}
                  <span>捐款形式：{DONATION_TYPE_LABELS[d.donationType] || "-"}</span>
                  {d.frequency && <span>捐款頻率：{DONATION_FREQUENCY_LABELS[d.frequency] || "-"}</span>}
                  <span>認捐狀態：{PLEDGE_STATUS_LABELS[d.pledgeStatus]?.label || "尚未接洽"}</span>
                </div>
                {d.progress && <p className="text-sm text-slate-500 mt-1">追蹤進度：{d.progress}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
