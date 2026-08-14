import { useMemo, useState } from "react";
import { ArrowLeft, Plus, ListTodo } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import ActionItemRow from "./ActionItemRow";
import ActionItemForm from "./ActionItemForm";

export default function MeetingDetail({ meeting, isAdmin, onBack }) {
  const { data: volunteers } = useCollection("volunteers");
  const { data: allActionItems } = useCollection("actionItems");
  const { create, update, remove } = useFirestoreCrud("actionItems");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const actionItems = useMemo(
    () => allActionItems.filter((a) => a.meetingId === meeting.id),
    [allActionItems, meeting.id]
  );

  const handleSubmit = async (data) => {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create({ ...data, meetingId: meeting.id });
    }
    setShowForm(false);
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft size={14} /> 回到會議列表
      </button>

      <Card className="mb-6">
        <h2 className="text-xl font-black italic text-slate-800 mb-1">{meeting.title}</h2>
        <p className="text-xs text-slate-400 mb-4">{meeting.date}</p>
        {meeting.attendeeNamesSnapshot?.length > 0 && (
          <p className="text-xs text-slate-500 mb-4">出席者：{meeting.attendeeNamesSnapshot.join("、")}</p>
        )}
        {meeting.agenda && (
          <div className="mb-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">議程</h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{meeting.agenda}</p>
          </div>
        )}
        {meeting.minutes && (
          <div className="mb-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">會議記錄</h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{meeting.minutes}</p>
          </div>
        )}
        {meeting.decisions && (
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">決議事項</h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{meeting.decisions}</p>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black italic text-slate-700">待辦事項</h3>
          <Button icon={Plus} onClick={() => { setEditing(null); setShowForm(true); }}>新增待辦</Button>
        </div>
        {actionItems.length === 0 ? (
          <EmptyState icon={ListTodo} title="還沒有待辦事項" />
        ) : (
          <ul className="space-y-3">
            {actionItems.map((item) => (
              <ActionItemRow
                key={item.id}
                item={item}
                isAdmin={isAdmin}
                onEdit={(i) => { setEditing(i); setShowForm(true); }}
                onDelete={setDeleting}
              />
            ))}
          </ul>
        )}
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "編輯待辦" : "新增待辦"}>
        <ActionItemForm initial={editing} volunteers={volunteers} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting.id)}
        message={deleting ? `確定要刪除待辦「${deleting.description}」嗎？` : ""}
      />
    </div>
  );
}
