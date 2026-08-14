import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const EMPTY = { description: "", assigneeId: "", dueDate: "", status: "open" };

export default function ActionItemForm({ initial, volunteers, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial, assigneeId: initial.assigneeId || "" } : EMPTY);
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const assignee = volunteers.find((v) => v.id === form.assigneeId);
    onSubmit({ ...form, assigneeId: form.assigneeId || null, assigneeName: assignee?.name || "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="待辦事項" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="負責人" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
          <option value="">（未指定）</option>
          {volunteers.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </Select>
        <Input label="截止日期" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
      </div>
      <Select label="狀態" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
        <option value="open">待處理</option>
        <option value="in_progress">進行中</option>
        <option value="done">已完成</option>
      </Select>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
