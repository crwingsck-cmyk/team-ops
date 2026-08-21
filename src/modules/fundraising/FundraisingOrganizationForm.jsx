import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import VolunteerSearchInput from "../../components/ui/VolunteerSearchInput";
import { PLEDGE_STATUS_LABELS, DONATION_TYPE_LABELS, DONATION_FREQUENCY_LABELS } from "../../constants/categoryStyles";

const EMPTY = {
  name: "",
  contactPerson: "",
  phone: "",
  heQi: "",
  huAi: "",
  xieLi: "",
  date: "",
  donationType: "casual",
  frequency: "one_time",
  amount: "",
  pledgeStatus: "not_yet",
  progress: "",
  notes: "",
  enteredBy: "",
};

export default function FundraisingOrganizationForm({ initial, heQiOptions = [], huAiOptions = [], xieLiOptions = [], volunteerOptions = [], onSubmit, onCancel }) {
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select label="和氣" value={form.heQi} onChange={(e) => setForm({ ...form, heQi: e.target.value })}>
          <option value="">未選擇</option>
          {heQiOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </Select>
        <Select label="互愛" value={form.huAi} onChange={(e) => setForm({ ...form, huAi: e.target.value })}>
          <option value="">未選擇</option>
          {huAiOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </Select>
        <Select label="協力" value={form.xieLi} onChange={(e) => setForm({ ...form, xieLi: e.target.value })}>
          <option value="">未選擇</option>
          {xieLiOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="日期" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Select label="捐款形式" value={form.donationType} onChange={(e) => setForm({ ...form, donationType: e.target.value })}>
          {Object.entries(DONATION_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select label="捐款頻率" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
          {Object.entries(DONATION_FREQUENCY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Input label="金額" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <Select label="認捐狀態" value={form.pledgeStatus} onChange={(e) => setForm({ ...form, pledgeStatus: e.target.value })}>
          {Object.entries(PLEDGE_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
      </div>
      <Input label="追蹤進度" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
      <label className="block">
        <span className="block text-base font-bold text-slate-600 mb-2">輸入者</span>
        <VolunteerSearchInput
          options={volunteerOptions}
          value={form.enteredBy}
          onChange={(text) => setForm({ ...form, enteredBy: text })}
        />
      </label>
      <Textarea label="備註（選填）" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
