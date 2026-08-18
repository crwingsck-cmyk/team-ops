import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const EMPTY = { description: "", assigneeId: "", helperNames: "", dueDate: "", expectedOutcome: "", status: "open" };

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
      <Input label="待執行事項" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select label="負責人" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
          <option value="">（未指定）</option>
          {volunteers.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </Select>
        <Input
          label="協助人員"
          value={form.helperNames}
          onChange={(e) => setForm({ ...form, helperNames: e.target.value })}
          placeholder="可打多個名字"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="完成期限" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        <Select label="追蹤狀態" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="open">待執行</option>
          <option value="in_progress">進行中</option>
          <option value="done">已完成</option>
        </Select>
      </div>
      <Input
        label="預期成果 / 交付物"
        value={form.expectedOutcome}
        onChange={(e) => setForm({ ...form, expectedOutcome: e.target.value })}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
