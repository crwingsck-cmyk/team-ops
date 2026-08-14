import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const EMPTY = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  capacity: "",
  registrationDeadline: "",
  status: "published",
};

export default function EventForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial, capacity: initial.capacity ?? "" } : EMPTY);
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      capacity: form.capacity === "" ? null : Number(form.capacity),
      registrationDeadline: form.registrationDeadline || null,
      endTime: form.endTime || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="活動名稱" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Textarea label="活動說明" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="grid grid-cols-3 gap-3">
        <Input label="日期" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Input label="開始時間" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
        <Input label="結束時間" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
      </div>
      <Input label="地點" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="人數上限（選填）" type="number" min="0" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        <Input label="報名截止日期（選填）" type="date" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} />
      </div>
      <Select label="狀態" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
        <option value="draft">草稿</option>
        <option value="published">已發布</option>
        <option value="cancelled">已取消</option>
      </Select>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
