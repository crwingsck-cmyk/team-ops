import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import { PLEDGE_STATUS_LABELS, DONATION_TYPE_LABELS } from "../../constants/categoryStyles";

const EMPTY = {
  name: "",
  contactPerson: "",
  phone: "",
  date: "",
  donationType: "casual",
  amount: "",
  pledgeStatus: "not_yet",
  progress: "",
  notes: "",
};

export default function FundraisingOrganizationForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial } : EMPTY);
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      amount: form.amount === "" ? 0 : Number(form.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="公司/團體名稱" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="聯絡人" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
        <Input label="電話" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="日期" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Select label="捐款形式" value={form.donationType} onChange={(e) => setForm({ ...form, donationType: e.target.value })}>
          {Object.entries(DONATION_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="金額" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <Select label="認捐狀態" value={form.pledgeStatus} onChange={(e) => setForm({ ...form, pledgeStatus: e.target.value })}>
          {Object.entries(PLEDGE_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
      </div>
      <Input label="追蹤進度" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
      <Textarea label="備註（選填）" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
