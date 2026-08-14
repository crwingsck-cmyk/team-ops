import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const EMPTY = { title: "", date: "", divisionId: "", attendeeIds: [], agenda: "", minutes: "", decisions: "" };

export default function MeetingForm({ initial, volunteers, divisions, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial, divisionId: initial.divisionId || "", attendeeIds: initial.attendeeIds || [] } : EMPTY);
  }, [initial]);

  const toggleAttendee = (id) => {
    setForm((f) => ({
      ...f,
      attendeeIds: f.attendeeIds.includes(id) ? f.attendeeIds.filter((a) => a !== id) : [...f.attendeeIds, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const attendeeNamesSnapshot = form.attendeeIds
      .map((id) => volunteers.find((v) => v.id === id)?.name)
      .filter(Boolean);
    onSubmit({ ...form, divisionId: form.divisionId || null, attendeeNamesSnapshot });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="會議名稱" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="日期" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Select label="所屬志業體（選填）" value={form.divisionId} onChange={(e) => setForm({ ...form, divisionId: e.target.value })}>
          <option value="">（未指定）</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
      </div>
      {volunteers.length > 0 && (
        <div>
          <span className="block text-xs font-bold text-slate-500 mb-1.5">出席者</span>
          <div className="flex flex-wrap gap-2">
            {volunteers.map((v) => (
              <button
                type="button"
                key={v.id}
                onClick={() => toggleAttendee(v.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  form.attendeeIds.includes(v.id) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <Textarea label="議程" value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} />
      <Textarea label="會議記錄" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} />
      <Textarea label="決議事項" value={form.decisions} onChange={(e) => setForm({ ...form, decisions: e.target.value })} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
