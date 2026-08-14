import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, CalendarDays, ClipboardList, Users, Phone } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import DivisionTaskForm from "./DivisionTaskForm";
import { TASK_STATUS } from "../../constants/categoryStyles";

export default function DivisionDetail({ division, onBack }) {
  const { data: volunteers } = useCollection("volunteers");
  const { data: events } = useCollection("events");
  const { data: meetings } = useCollection("meetings");
  const { data: tasks } = useCollection("divisionTasks");
  const { create, update, remove } = useFirestoreCrud("divisionTasks");

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const divisionVolunteers = useMemo(
    () => volunteers.filter((v) => (v.divisionIds || []).includes(division.id)),
    [volunteers, division.id]
  );
  const divisionEvents = useMemo(() => events.filter((e) => e.divisionId === division.id), [events, division.id]);
  const divisionMeetings = useMemo(() => meetings.filter((m) => m.divisionId === division.id), [meetings, division.id]);
  const divisionTasks = useMemo(() => tasks.filter((t) => t.divisionId === division.id), [tasks, division.id]);

  const openCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleTaskSubmit = async (data) => {
    if (editingTask) {
      await update(editingTask.id, data);
    } else {
      await create({ ...data, divisionId: division.id });
    }
    setShowTaskForm(false);
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft size={14} /> 回到志業體列表
      </button>

      <Card className="mb-6">
        <h2 className="text-xl font-black italic text-slate-800 mb-1">{division.name}</h2>
        {division.description && <p className="text-sm text-slate-500 mb-3">{division.description}</p>}
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          {division.contactPersonName && (
            <span>聯絡窗口：<span className="font-bold text-slate-700">{division.contactPersonName}</span></span>
          )}
          {division.contactInfo && (
            <span className="flex items-center gap-1"><Phone size={12} />{division.contactInfo}</span>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><CalendarDays className="text-indigo-500" size={18} /></div>
          <div><p className="text-2xl font-black text-slate-800">{divisionEvents.length}</p><p className="text-xs text-slate-400">相關活動</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><ClipboardList className="text-emerald-500" size={18} /></div>
          <div><p className="text-2xl font-black text-slate-800">{divisionMeetings.length}</p><p className="text-xs text-slate-400">相關會議</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Users className="text-amber-500" size={18} /></div>
          <div><p className="text-2xl font-black text-slate-800">{divisionVolunteers.length}</p><p className="text-xs text-slate-400">隸屬志工</p></div>
        </Card>
      </div>

      {divisionEvents.length > 0 && (
        <Card className="mb-6">
          <h3 className="font-black italic text-slate-700 mb-3">相關活動</h3>
          <ul className="space-y-2">
            {divisionEvents.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{e.title}</span>
                <span className="text-xs text-slate-400">{e.date}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {divisionMeetings.length > 0 && (
        <Card className="mb-6">
          <h3 className="font-black italic text-slate-700 mb-3">相關會議</h3>
          <ul className="space-y-2">
            {divisionMeetings.map((m) => (
              <li key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{m.title}</span>
                <span className="text-xs text-slate-400">{m.date}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black italic text-slate-700">工作項目</h3>
          <Button icon={Plus} onClick={openCreateTask}>新增任務</Button>
        </div>
        {divisionTasks.length === 0 ? (
          <EmptyState icon={ClipboardList} title="還沒有工作項目" />
        ) : (
          <ul className="space-y-3">
            {divisionTasks.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50">
                <div>
                  <p className="font-bold text-sm text-slate-800">{t.title}</p>
                  {t.description && <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge tone={TASK_STATUS[t.status]}>{TASK_STATUS[t.status]?.label}</Badge>
                    {t.assigneeName && <span className="text-[10px] text-slate-400">負責人：{t.assigneeName}</span>}
                    {t.dueDate && <span className="text-[10px] text-slate-400">截止：{t.dueDate}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditingTask(t); setShowTaskForm(true); }} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeletingTask(t)} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-rose-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={showTaskForm} onClose={() => setShowTaskForm(false)} title={editingTask ? "編輯任務" : "新增任務"}>
        <DivisionTaskForm initial={editingTask} volunteers={volunteers} onSubmit={handleTaskSubmit} onCancel={() => setShowTaskForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => remove(deletingTask.id)}
        message={deletingTask ? `確定要刪除任務「${deletingTask.title}」嗎？` : ""}
      />
    </div>
  );
}
