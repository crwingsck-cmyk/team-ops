import { useMemo, useState } from "react";
import { Plus, CalendarDays } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import EventCard from "./EventCard";
import EventForm from "./EventForm";
import EventDetail from "./EventDetail";

export default function EventsPage() {
  const { data: events, loading } = useCollection("events", { orderByField: "date", orderByDirection: "desc" });
  const { data: divisions } = useCollection("divisions");
  const { data: registrations } = useCollection("registrations");
  const { create, update, remove } = useFirestoreCrud("events");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const divisionsById = useMemo(() => Object.fromEntries(divisions.map((d) => [d.id, d])), [divisions]);
  const registrationCountByEvent = useMemo(() => {
    const counts = {};
    for (const r of registrations) {
      if (r.status === "cancelled") continue;
      counts[r.eventId] = (counts[r.eventId] || 0) + 1;
    }
    return counts;
  }, [registrations]);

  const selected = events.find((e) => e.id === selectedId);

  if (selected) {
    return (
      <EventDetail
        event={selected}
        divisionName={selected.divisionId ? divisionsById[selected.divisionId]?.name : null}
        onBack={() => setSelectedId(null)}
      />
    );
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
        <h2 className="text-xl font-black italic text-slate-800">活動</h2>
        <Button icon={Plus} onClick={openCreate}>新增活動</Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="還沒有活動"
          description="建立活動並開放志工報名。"
          action={<Button icon={Plus} onClick={openCreate}>新增活動</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              registrationCount={registrationCountByEvent[e.id] || 0}
              divisionName={e.divisionId ? divisionsById[e.divisionId]?.name : null}
              onOpen={(item) => setSelectedId(item.id)}
              onEdit={(item) => { setEditing(item); setShowForm(true); }}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "編輯活動" : "新增活動"}>
        <EventForm initial={editing} divisions={divisions} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting.id)}
        message={deleting ? `確定要刪除活動「${deleting.title}」嗎？` : ""}
      />
    </div>
  );
}
