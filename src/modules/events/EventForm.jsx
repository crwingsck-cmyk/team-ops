import { useEffect, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import ImageUploadField from "../../components/ui/ImageUploadField";
import { LINK_TYPE_LABELS } from "../../constants/categoryStyles";
import { computeDateRange } from "../../lib/eventDays";

const EMPTY_DAY = { date: "", startTime: "", endTime: "", location: "" };

const EMPTY = {
  title: "",
  description: "",
  days: [EMPTY_DAY],
  capacity: "",
  registrationDeadline: "",
  status: "published",
  links: [],
  posterUrl: "",
  posterPath: "",
};

export default function EventForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!initial) {
      setForm(EMPTY);
      return;
    }
    const days = initial.days?.length
      ? initial.days
      : [{ date: initial.date || "", startTime: initial.startTime || "", endTime: initial.endTime || "", location: initial.location || "" }];
    setForm({ ...EMPTY, ...initial, days, capacity: initial.capacity ?? "", links: initial.links || [] });
  }, [initial]);

  const addDay = () => setForm((f) => ({ ...f, days: [...f.days, { ...EMPTY_DAY }] }));
  const updateDay = (i, key, value) =>
    setForm((f) => ({ ...f, days: f.days.map((d, idx) => (idx === i ? { ...d, [key]: value } : d)) }));
  const removeDay = (i) => setForm((f) => ({ ...f, days: f.days.filter((_, idx) => idx !== i) }));

  const addLink = () => setForm((f) => ({ ...f, links: [...f.links, { label: "", url: "", type: "registration" }] }));
  const updateLink = (i, key, value) =>
    setForm((f) => ({ ...f, links: f.links.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)) }));
  const removeLink = (i) => setForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const days = form.days.map((d) => ({ ...d, endTime: d.endTime || null }));
    const { date, endDate } = computeDateRange(days);
    onSubmit({
      ...form,
      days,
      date,
      endDate,
      capacity: form.capacity === "" ? null : Number(form.capacity),
      registrationDeadline: form.registrationDeadline || null,
      links: form.links.filter((l) => l.label || l.url),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="活動名稱" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Textarea label="活動說明" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="block text-base font-bold text-slate-600">日期與地點（活動連續幾天，地點可各自不同）</span>
          <button type="button" onClick={addDay} className="text-base text-indigo-600 font-bold flex items-center gap-1">
            <Plus size={16} /> 新增一天
          </button>
        </div>
        <div className="space-y-3">
          {form.days.map((d, i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">第 {i + 1} 天</span>
                {form.days.length > 1 && (
                  <button type="button" onClick={() => removeDay(i)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input type="date" required value={d.date} onChange={(e) => updateDay(i, "date", e.target.value)} />
                <Input type="time" placeholder="開始時間" value={d.startTime} onChange={(e) => updateDay(i, "startTime", e.target.value)} />
                <Input type="time" placeholder="結束時間" value={d.endTime} onChange={(e) => updateDay(i, "endTime", e.target.value)} />
              </div>
              <Input placeholder="地點" value={d.location} onChange={(e) => updateDay(i, "location", e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="人數上限（選填）" type="number" min="0" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        <Input label="報名截止日期（選填）" type="date" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} />
      </div>
      <Select label="狀態" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
        <option value="draft">草稿</option>
        <option value="published">已發布</option>
        <option value="cancelled">已取消</option>
      </Select>

      <ImageUploadField
        folder="events"
        url={form.posterUrl}
        path={form.posterPath}
        onChange={({ url, path }) => setForm((f) => ({ ...f, posterUrl: url, posterPath: path }))}
        onUploadingChange={setUploading}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="block text-base font-bold text-slate-600">相關連結（選填，例：報名連結、Zoom 會議）</span>
          <button type="button" onClick={addLink} className="text-base text-indigo-600 font-bold flex items-center gap-1">
            <Plus size={16} /> 新增連結
          </button>
        </div>
        <div className="space-y-2.5">
          {form.links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <select
                value={l.type || "registration"}
                onChange={(e) => updateLink(i, "type", e.target.value)}
                className="w-32 px-2.5 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-white"
              >
                {Object.entries(LINK_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                placeholder="名稱"
                value={l.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                className="w-28 px-3 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200"
              />
              <input
                placeholder="https://..."
                value={l.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200"
              />
              <button type="button" onClick={() => removeLink(i)} className="p-2 text-slate-400 hover:text-rose-600">
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={uploading}>儲存</Button>
      </div>
    </form>
  );
}
