import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { PLEDGE_STATUS_LABELS, DONATION_TYPE_LABELS, XIN_LIAN_FREQUENCY_LABELS } from "../../constants/categoryStyles";

const EMPTY_DONOR = { name: "", donationType: "casual", xinLianFrequency: "monthly", xinLianFrequencyCustom: "", amount: "" };
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
        <div className="space-y-3">
          {form.donors.map((d, i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">捐款者 {i + 1}</span>
                <button type="button" onClick={() => removeDonor(i)} className="text-slate-400 hover:text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <Input label="姓名" value={d.name} onChange={(e) => updateDonor(i, "name", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Select label="捐款形式" value={d.donationType} onChange={(e) => updateDonor(i, "donationType", e.target.value)}>
                  {Object.entries(DONATION_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
                <Input label="金額" type="number" min="0" value={d.amount} onChange={(e) => updateDonor(i, "amount", e.target.value)} />
              </div>
              {d.donationType === "xin_lian" && (
                <div className="grid grid-cols-2 gap-3">
                  <Select label="頻率" value={d.xinLianFrequency} onChange={(e) => updateDonor(i, "xinLianFrequency", e.target.value)}>
                    {Object.entries(XIN_LIAN_FREQUENCY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </Select>
                  {d.xinLianFrequency === "custom" && (
                    <Input
                      label="自訂頻率說明"
                      value={d.xinLianFrequencyCustom}
                      onChange={(e) => updateDonor(i, "xinLianFrequencyCustom", e.target.value)}
                    />
                  )}
                </div>
              )}
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
