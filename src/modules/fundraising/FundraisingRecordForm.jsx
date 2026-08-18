import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { PLEDGE_STATUS_LABELS } from "../../constants/categoryStyles";

const EMPTY = { solicitor: "", amount: "", pledgeStatus: "not_yet", progress: "" };

export default function FundraisingRecordForm({ person, initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial, amount: initial.amount ?? "" } : EMPTY);
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, amount: form.amount === "" ? 0 : Number(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {person && (
        <div className="p-3 rounded-xl bg-slate-50">
          <p className="font-bold text-lg text-slate-800">{person.name}</p>
          <p className="text-sm text-slate-500">{person.phone || "-"}</p>
        </div>
      )}
      <Input label="募款人（勸募者）" value={form.solicitor} onChange={(e) => setForm({ ...form, solicitor: e.target.value })} />
      <Input label="募款金額" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
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
