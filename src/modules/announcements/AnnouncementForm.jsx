import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { ANNOUNCEMENT_CATEGORIES } from "../../constants/categoryStyles";

const EMPTY = { title: "", content: "", category: "一般", publishDate: "", expiryDate: "", links: [] };

export default function AnnouncementForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial, links: initial.links || [] } : { ...EMPTY, publishDate: new Date().toISOString().slice(0, 10) });
  }, [initial]);

  const addLink = () => setForm((f) => ({ ...f, links: [...f.links, { label: "", url: "" }] }));
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
      <div className="grid grid-cols-3 gap-3">
        <Select label="分類" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {Object.keys(ANNOUNCEMENT_CATEGORIES).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Input label="發布日期" type="date" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} />
        <Input label="到期日期（選填）" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="block text-xs font-bold text-slate-500">相關連結（選填）</span>
          <button type="button" onClick={addLink} className="text-xs text-indigo-600 font-bold flex items-center gap-1">
            <Plus size={12} /> 新增連結
          </button>
        </div>
        <div className="space-y-2">
          {form.links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="名稱"
                value={l.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                className="w-28 px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
              <input
                placeholder="https://..."
                value={l.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
              <button type="button" onClick={() => removeLink(i)} className="p-2 text-slate-400 hover:text-rose-600">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
