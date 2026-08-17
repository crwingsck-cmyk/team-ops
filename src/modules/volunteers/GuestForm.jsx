import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";

const EMPTY = {
  name: "",
  phone: "",
  area: "",
  notes: "",
};

export default function GuestForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial } : EMPTY);
  }, [initial]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="姓名" value={form.name} onChange={set("name")} required />
      <Input label="電話" value={form.phone} onChange={set("phone")} />
      <Input label="居住地區 / 地址" value={form.area} onChange={set("area")} />
      <Textarea label="備註" value={form.notes} onChange={set("notes")} rows={3} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
