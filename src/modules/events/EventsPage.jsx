import { useMemo, useState } from "react";
import { Plus, CalendarDays, LayoutTemplate } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import { useMembership } from "../../hooks/useMembership";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import ListControls from "../../components/ui/ListControls";
import EventCard from "./EventCard";
import EventForm from "./EventForm";
import EventDetail from "./EventDetail";
import EventTemplateManager from "./EventTemplateManager";

export default function EventsPage() {
  const [sort, setSort] = useState("desc");
  const [view, setView] = useState("list");

  const { data: events, loading } = useCollection("events", { orderByField: "date", orderByDirection: sort });
  const { data: registrations } = useCollection("registrations");
  const { create, update, remove } = useFirestoreCrud("events");
  const { isAdmin } = useMembership();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

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
    return <EventDetail event={selected} isAdmin={isAdmin} onBack={() => setSelectedId(null)} />;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-black italic text-slate-800">活動</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={LayoutTemplate} onClick={() => setShowTemplates(true)}>管理範本</Button>
          <Button icon={Plus} onClick={openCreate}>新增活動</Button>
        </div>
      </div>

      {events.length > 0 && <ListControls view={view} onViewChange={setView} sort={sort} onSortChange={setSort} />}

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
        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              layout={view}
              isAdmin={isAdmin}
              registrationCount={registrationCountByEvent[e.id] || 0}
              onOpen={(item) => setSelectedId(item.id)}
              onEdit={(item) => { setEditing(item); setShowForm(true); }}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "編輯活動" : "新增活動"}>
        <EventForm initial={editing} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal open={showTemplates} onClose={() => setShowTemplates(false)} title="活動範本">
        <EventTemplateManager onClose={() => setShowTemplates(false)} />
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
