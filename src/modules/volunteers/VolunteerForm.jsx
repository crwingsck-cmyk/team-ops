import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  lineId: "",
  skills: "",
  divisionIds: [],
  joinDate: "",
  status: "active",
  notes: "",
};

export default function VolunteerForm({ initial, divisions, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initial) {
      setForm({
        ...EMPTY,
        ...initial,
        skills: (initial.skills || []).join(", "),
        divisionIds: initial.divisionIds || [],
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial]);

  const toggleDivision = (id) => {
    setForm((f) => ({
      ...f,
      divisionIds: f.divisionIds.includes(id)
        ? f.divisionIds.filter((d) => d !== id)
        : [...f.divisionIds, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="姓名" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="電話" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="LINE ID" value={form.lineId} onChange={(e) => setForm({ ...form, lineId: e.target.value })} />
        <Input label="加入日期" type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
      </div>
      <Input
        label="專長標籤（用逗號分隔）"
        value={form.skills}
        onChange={(e) => setForm({ ...form, skills: e.target.value })}
        placeholder="例：司機, 香積, 翻譯"
      />
      {divisions.length > 0 && (
        <div>
          <span className="block text-xs font-bold text-slate-500 mb-1.5">隸屬志業體</span>
          <div className="flex flex-wrap gap-2">
            {divisions.map((d) => (
              <button
                type="button"
                key={d.id}
                onClick={() => toggleDivision(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  form.divisionIds.includes(d.id)
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <Select label="狀態" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
        <option value="active">在職</option>
        <option value="inactive">非在職</option>
      </Select>
      <Textarea label="備註" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
