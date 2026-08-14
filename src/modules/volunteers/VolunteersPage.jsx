import { useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import VolunteerCard from "./VolunteerCard";
import VolunteerForm from "./VolunteerForm";
import VolunteerFilterBar from "./VolunteerFilterBar";

export default function VolunteersPage() {
  const { data: volunteers, loading } = useCollection("volunteers");
  const { create, update, remove } = useFirestoreCrud("volunteers");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      if (status !== "all" && v.status !== status) return false;
      if (!search) return true;
      const haystack = `${v.name} ${v.phone || ""} ${v.email || ""} ${(v.skills || []).join(" ")}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [volunteers, search, status]);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (volunteer) => {
    setEditing(volunteer);
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
        <h2 className="text-xl font-black italic text-slate-800">志工資料庫</h2>
        <Button icon={Plus} onClick={openCreate}>新增志工</Button>
      </div>

      <VolunteerFilterBar search={search} onSearch={setSearch} status={status} onStatus={setStatus} />

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="還沒有志工資料"
          description="點選「新增志工」開始建立團隊的志工資料庫。"
          action={<Button icon={Plus} onClick={openCreate}>新增志工</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v) => (
            <VolunteerCard
              key={v.id}
              volunteer={v}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "編輯志工" : "新增志工"}>
        <VolunteerForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting.id)}
        message={deleting ? `確定要刪除志工「${deleting.name}」嗎？` : ""}
      />
    </div>
  );
}
