import { useState } from "react";
import { Plus, ClipboardList, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import { useMembership } from "../../hooks/useMembership";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import MeetingForm from "./MeetingForm";
import MeetingDetail from "./MeetingDetail";

export default function MeetingsPage() {
  const { data: meetings, loading } = useCollection("meetings", { orderByField: "date", orderByDirection: "desc" });
  const { data: volunteers } = useCollection("volunteers");
  const { create, update, remove } = useFirestoreCrud("meetings");
  const { isAdmin } = useMembership();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const selected = meetings.find((m) => m.id === selectedId);

  if (selected) {
    return <MeetingDetail meeting={selected} isAdmin={isAdmin} onBack={() => setSelectedId(null)} />;
  }

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleSubmit = async (data) => {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black italic text-slate-800">會議記錄</h2>
        <Button icon={Plus} onClick={openCreate}>新增會議</Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="還沒有會議記錄"
          description="建立會議記錄、追蹤議程決議與待辦事項。"
          action={<Button icon={Plus} onClick={openCreate}>新增會議</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((m) => (
            <Card key={m.id} className="cursor-pointer" onClick={() => setSelectedId(m.id)}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-black italic text-slate-800 text-2xl">{m.title}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(m); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                  >
                    <Pencil size={18} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleting(m); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-lg text-slate-500 mb-3">{m.date}</p>
              <div className="flex items-center justify-between text-lg text-slate-500">
                <span>{m.attendeeNamesSnapshot?.length || 0} 位出席</span>
                <ChevronRight size={18} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "編輯會議" : "新增會議"}>
        <MeetingForm initial={editing} volunteers={volunteers} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting.id)}
        message={deleting ? `確定要刪除會議「${deleting.title}」嗎？` : ""}
      />
    </div>
  );
}
