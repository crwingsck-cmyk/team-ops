import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { PLEDGE_STATUS_LABELS, DONATION_TYPE_LABELS } from "../../constants/categoryStyles";

const EMPTY_DONOR = { name: "", donationType: "casual", amount: "" };
const EMPTY = { donors: [], pledgeStatus: "not_yet", progress: "" };

export default function FundraisingRecordForm({ person, initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initial) {
      const donors = (initial.donors || []).map((d) => ({ ...EMPTY_DONOR, ...d, amount: d.amount ?? "" }));
      setForm({ ...EMPTY, ...initial, donors });
    } else {
      setForm(EMPTY);
    }
  }, [initial]);

  const addDonor = () => setForm((f) => ({ ...f, donors: [...f.donors, { ...EMPTY_DONOR }] }));
  const updateDonor = (i, key, value) =>
    setForm((f) => ({ ...f, donors: f.donors.map((d, idx) => (idx === i ? { ...d, [key]: value } : d)) }));
  const removeDonor = (i) => setForm((f) => ({ ...f, donors: f.donors.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const donors = form.donors
      .filter((d) => d.name || d.amount)
      .map((d) => ({ ...d, amount: d.amount === "" ? 0 : Number(d.amount) }));
    onSubmit({ donors, pledgeStatus: form.pledgeStatus, progress: form.progress });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {person && (
        <div className="p-3 rounded-xl bg-slate-50">
          <p className="font-bold text-lg text-slate-800">{person.name}</p>
          <p className="text-sm text-slate-500">{person.phone || "-"}</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="block text-base font-bold text-slate-600">捐款者（每人獨立輸入）</span>
          <button type="button" onClick={addDonor} className="text-base text-indigo-600 font-bold flex items-center gap-1">
            <Plus size={16} /> 新增捐款者
          </button>
        </div>
        {form.donors.length > 0 && (
          <div className="hidden sm:flex gap-2 px-1 mb-1 text-sm font-bold text-slate-500">
            <span className="flex-1">姓名</span>
            <span className="w-32">捐款形式</span>
            <span className="w-24">金額</span>
            <span className="w-8" />
          </div>
        )}
        <div className="space-y-2.5">
          {form.donors.map((d, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="姓名"
                value={d.name}
                onChange={(e) => updateDonor(i, "name", e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200"
              />
              <select
                value={d.donationType}
                onChange={(e) => updateDonor(i, "donationType", e.target.value)}
                className="w-32 px-2.5 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-white"
              >
                {Object.entries(DONATION_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                placeholder="金額"
                value={d.amount}
                onChange={(e) => updateDonor(i, "amount", e.target.value)}
                className="w-24 px-3 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200"
              />
              <button type="button" onClick={() => removeDonor(i)} className="p-2 text-slate-400 hover:text-rose-600">
                <X size={18} />
              </button>
            </div>
          ))}
          {form.donors.length === 0 && (
            <p className="text-sm text-slate-400 italic">還沒有捐款者，點「新增捐款者」開始新增。</p>
          )}
        </div>
      </div>

      <Select label="認捐狀態" value={form.pledgeStatus} onChange={(e) => setForm({ ...form, pledgeStatus: e.target.value })}>
        {Object.entries(PLEDGE_STATUS_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </Select>
      <Textarea label="追蹤進度" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
