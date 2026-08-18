import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const EMPTY = {
  date: "",
  time: "",
  location: "",
  eventType: "",
  amount: "",
  volunteerCount: "",
  guestCount: "",
  submittedBy: "",
};

export default function FundraisingEventForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial } : EMPTY);
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      amount: form.amount === "" ? 0 : Number(form.amount),
      volunteerCount: form.volunteerCount === "" ? 0 : Number(form.volunteerCount),
      guestCount: form.guestCount === "" ? 0 : Number(form.guestCount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="日期" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Input label="時間" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="地點" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <Input
          label="活動形式"
          placeholder="例：園遊會、感恩會"
          value={form.eventType}
          onChange={(e) => setForm({ ...form, eventType: e.target.value })}
        />
      </div>
      <Input label="募款金額" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="出席志工人數"
          type="number"
          min="0"
          value={form.volunteerCount}
          onChange={(e) => setForm({ ...form, volunteerCount: e.target.value })}
        />
        <Input
          label="出席大德人數"
          type="number"
          min="0"
          value={form.guestCount}
          onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
        />
      </div>
      <Input label="填表者" value={form.submittedBy} onChange={(e) => setForm({ ...form, submittedBy: e.target.value })} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
