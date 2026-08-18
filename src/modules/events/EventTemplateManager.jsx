import { useState } from "react";
import { Plus, Pencil, Trash2, LayoutTemplate } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import EventTemplateForm from "./EventTemplateForm";

export default function EventTemplateManager({ onClose }) {
  const { data: templates, loading } = useCollection("eventTemplates");
  const { create, update, remove } = useFirestoreCrud("eventTemplates");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

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
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-500">管理每月固定活動的範本，建立新活動時可以直接套用。</p>
        <Button icon={Plus} onClick={openCreate}>新增範本</Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400 italic">載入中...</div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="還沒有活動範本"
          description="建立範本後，下次新增活動時可以直接套用，不用重新輸入資料。"
          action={<Button icon={Plus} onClick={openCreate}>新增範本</Button>}
        />
      ) : (
        <div className="space-y-2.5">
          {templates.map((t) => (
            <Card key={t.id} className="!p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-black text-slate-800 truncate">{t.title}</h4>
                  {t.defaultLocation && <p className="text-sm text-slate-500 mt-1">{t.defaultLocation}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditing(t); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => setDeleting(t)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button variant="secondary" onClick={onClose}>關閉</Button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "編輯範本" : "新增範本"}>
        <EventTemplateForm initial={editing} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting.id)}
        message={deleting ? `確定要刪除範本「${deleting.title}」嗎？` : ""}
      />
    </div>
  );
}
