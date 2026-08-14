import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const EMPTY = { name: "", description: "", contactPersonId: "", contactInfo: "" };

export default function DivisionForm({ initial, volunteers, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial, contactPersonId: initial.contactPersonId || "" } : EMPTY);
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const contactPerson = volunteers.find((v) => v.id === form.contactPersonId);
    onSubmit({
      ...form,
      contactPersonId: form.contactPersonId || null,
      contactPersonName: contactPerson?.name || "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="志業體名稱" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：慈善、醫療、教育、人文" />
      <Textarea label="簡介" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <Select label="聯絡窗口" value={form.contactPersonId} onChange={(e) => setForm({ ...form, contactPersonId: e.target.value })}>
        <option value="">（未指定）</option>
        {volunteers.map((v) => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </Select>
      <Input label="聯絡方式" value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} placeholder="電話 / Email / LINE" />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
