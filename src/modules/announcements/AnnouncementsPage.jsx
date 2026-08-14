import { useState } from "react";
import { Plus, Megaphone } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementForm from "./AnnouncementForm";

export default function AnnouncementsPage() {
  const { data: announcements, loading } = useCollection("announcements", {
    orderByField: "publishDate",
    orderByDirection: "desc",
  });
  const { create, update, remove } = useFirestoreCrud("announcements");

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black italic text-slate-800">公告</h2>
        <Button icon={Plus} onClick={openCreate}>發布公告</Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="還沒有公告"
          description="發布活動訊息、重要通知給全體團隊成員。"
          action={<Button icon={Plus} onClick={openCreate}>發布公告</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              onEdit={(item) => { setEditing(item); setShowForm(true); }}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "編輯公告" : "發布公告"}>
        <AnnouncementForm initial={editing} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting.id)}
        message={deleting ? `確定要刪除公告「${deleting.title}」嗎？` : ""}
      />
    </div>
  );
}
