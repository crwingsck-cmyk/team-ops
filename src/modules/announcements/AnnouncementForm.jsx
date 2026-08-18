import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import ImageUploadField from "../../components/ui/ImageUploadField";
import { ANNOUNCEMENT_CATEGORIES, LINK_TYPE_LABELS } from "../../constants/categoryStyles";

const EMPTY = {
  title: "",
  content: "",
  category: "一般",
  audience: "",
  publishDate: "",
  expiryDate: "",
  links: [],
  posterUrl: "",
  posterPath: "",
};

export default function AnnouncementForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial, links: initial.links || [] } : { ...EMPTY, publishDate: new Date().toISOString().slice(0, 10) });
  }, [initial]);

  const addLink = () => setForm((f) => ({ ...f, links: [...f.links, { label: "", url: "", type: "webpage" }] }));
  const updateLink = (i, key, value) =>
    setForm((f) => ({ ...f, links: f.links.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)) }));
  const removeLink = (i) => setForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, links: form.links.filter((l) => l.label || l.url) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="標題" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Textarea label="內容" required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select label="分類" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {Object.keys(ANNOUNCEMENT_CATEGORIES).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Input
          label="發布對象（選填）"
          value={form.audience}
          onChange={(e) => setForm({ ...form, audience: e.target.value })}
          placeholder="例：全體志工、教育志業體"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="發布日期" type="date" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} />
        <Input label="到期日期（選填）" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
      </div>

      <ImageUploadField
        folder="announcements"
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
                value={l.type || "webpage"}
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
