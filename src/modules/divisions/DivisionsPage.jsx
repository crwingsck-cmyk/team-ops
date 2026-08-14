import { useState } from "react";
import { Plus, Building2, Pencil, Trash2, ChevronRight } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import DivisionForm from "./DivisionForm";
import DivisionDetail from "./DivisionDetail";

export default function DivisionsPage() {
  const { data: divisions, loading } = useCollection("divisions");
  const { data: volunteers } = useCollection("volunteers");
  const { create, update, remove } = useFirestoreCrud("divisions");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const selected = divisions.find((d) => d.id === selectedId);

  if (selected) {
    return <DivisionDetail division={selected} onBack={() => setSelectedId(null)} />;
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
        <h2 className="text-xl font-black italic text-slate-800">志業體</h2>
        <Button icon={Plus} onClick={openCreate}>新增志業體</Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : divisions.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="還沒有志業體資料"
          description="建立慈善、醫療、教育、人文等志業體，管理各自的聯絡窗口與工作項目。"
          action={<Button icon={Plus} onClick={openCreate}>新增志業體</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {divisions.map((d) => (
            <Card key={d.id} className="cursor-pointer" onClick={() => setSelectedId(d.id)}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-black italic text-slate-800">{d.name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(d); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleting(d); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {d.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{d.description}</p>}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{d.contactPersonName ? `窗口：${d.contactPersonName}` : "尚未指定窗口"}</span>
                <ChevronRight size={14} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "編輯志業體" : "新增志業體"}>
        <DivisionForm initial={editing} volunteers={volunteers} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting.id)}
        message={deleting ? `確定要刪除志業體「${deleting.name}」嗎？` : ""}
      />
    </div>
  );
}
