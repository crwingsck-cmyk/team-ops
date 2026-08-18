import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import ImageUploadField from "../../components/ui/ImageUploadField";
import { LINK_TYPE_LABELS } from "../../constants/categoryStyles";

const EMPTY = {
  title: "",
  description: "",
  defaultStartTime: "",
  defaultEndTime: "",
  defaultLocation: "",
  capacity: "",
  links: [],
  posterUrl: "",
  posterPath: "",
};

export default function EventTemplateForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial, capacity: initial.capacity ?? "", links: initial.links || [] } : EMPTY);
  }, [initial]);

  const addLink = () => setForm((f) => ({ ...f, links: [...f.links, { label: "", url: "", type: "registration" }] }));
  const updateLink = (i, key, value) =>
    setForm((f) => ({ ...f, links: f.links.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)) }));
  const removeLink = (i) => setForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      capacity: form.capacity === "" ? null : Number(form.capacity),
      links: form.links.filter((l) => l.label || l.url),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="範本名稱（活動名稱）" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Textarea label="活動說明" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

      <div className="grid grid-cols-2 gap-3">
        <Input type="time" label="預設開始時間" value={form.defaultStartTime} onChange={(e) => setForm({ ...form, defaultStartTime: e.target.value })} />
        <Input type="time" label="預設結束時間" value={form.defaultEndTime} onChange={(e) => setForm({ ...form, defaultEndTime: e.target.value })} />
      </div>
      <Input label="預設地點" value={form.defaultLocation} onChange={(e) => setForm({ ...form, defaultLocation: e.target.value })} />
      <Input label="人數上限（選填）" type="number" min="0" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />

      <ImageUploadField
        folder="eventTemplates"
        url={form.posterUrl}
        path={form.posterPath}
        onChange={({ url, path }) => setForm((f) => ({ ...f, posterUrl: url, posterPath: path }))}
        onUploadingChange={setUploading}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="block text-base font-bold text-slate-600">相關連結（選填）</span>
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
        <Button type="submit" disabled={uploading}>儲存範本</Button>
      </div>
    </form>
  );
}
