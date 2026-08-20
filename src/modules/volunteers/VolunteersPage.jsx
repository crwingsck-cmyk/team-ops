import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Users, Upload, LayoutGrid, List } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import { useMembership } from "../../hooks/useMembership";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import VolunteerCard from "./VolunteerCard";
import VolunteerListView from "./VolunteerListView";
import VolunteerForm from "./VolunteerForm";
import VolunteerDetail from "./VolunteerDetail";
import VolunteerFilterBar from "./VolunteerFilterBar";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import VolunteerImportModal from "./VolunteerImportModal";
import GuestDirectory from "./GuestDirectory";
import GuestForm from "./GuestForm";
import GuestDetail from "./GuestDetail";
import GuestImportModal from "./GuestImportModal";
import { VOLUNTEER_FILTER_FIELDS, DEFAULT_VOLUNTEER_FILTER_KEYS, volunteerFilterOptionLabel } from "../../constants/volunteerFilterFields";
import { chineseIncludes } from "../../lib/chineseSearch";

const FILTER_KEYS_STORAGE_KEY = "team-ops:volunteerFilterKeys";

function loadStoredFilterKeys() {
  const validKeys = new Set(VOLUNTEER_FILTER_FIELDS.map((f) => f.key));
  try {
    const stored = JSON.parse(localStorage.getItem(FILTER_KEYS_STORAGE_KEY));
    if (Array.isArray(stored)) {
      const filtered = stored.filter((k) => validKeys.has(k)).slice(0, 5);
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // ignore malformed storage
  }
  return DEFAULT_VOLUNTEER_FILTER_KEYS;
}

export default function VolunteersPage() {
  const { data: volunteers, loading } = useCollection("volunteers");
  const { data: registrations } = useCollection("registrations");
  const { data: events } = useCollection("events", { includeDeleted: true });
  const { data: guests } = useCollection("guests", { includeDeleted: true });
  const { create, update, remove } = useFirestoreCrud("volunteers");
  const { create: createGuest, update: updateGuest, remove: removeGuest } = useFirestoreCrud("guests");
  const { isAdmin } = useMembership();

  const [dbMode, setDbMode] = useState("volunteer");
  const [search, setSearch] = useState("");
  const [activeFilterKeys, setActiveFilterKeys] = useState(loadStoredFilterKeys);
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(VOLUNTEER_FILTER_FIELDS.map((f) => [f.key, "all"]))
  );
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showGuestImport, setShowGuestImport] = useState(false);
  const [viewingGuest, setViewingGuest] = useState(null);
  const [editingGuest, setEditingGuest] = useState(null);
  const [deletingGuest, setDeletingGuest] = useState(null);

  useEffect(() => {
    localStorage.setItem(FILTER_KEYS_STORAGE_KEY, JSON.stringify(activeFilterKeys));
  }, [activeFilterKeys]);

  const fieldOptionsMap = useMemo(() => {
    const map = {};
    VOLUNTEER_FILTER_FIELDS.forEach((field) => {
      if (field.source === "enum") {
        map[field.key] = Object.keys(field.enumOptions).map((k) => ({
          value: k,
          label: volunteerFilterOptionLabel(field, k),
        }));
        return;
      }
      const set = new Set();
      volunteers.forEach((v) => {
        const raw = v[field.key];
        const values = field.source === "dynamicArray"
          ? (Array.isArray(raw) ? raw : [raw].filter(Boolean))
          : (raw ? [String(raw)] : []);
        values.forEach((val) => val && set.add(val));
      });
      map[field.key] = [...set].sort().map((v) => ({ value: v, label: v }));
    });
    return map;
  }, [volunteers]);

  const setFilterValue = (key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }));

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      for (const key of activeFilterKeys) {
        const wanted = filterValues[key];
        if (!wanted || wanted === "all") continue;
        const fieldVal = v[key];
        const matches = Array.isArray(fieldVal) ? fieldVal.includes(wanted) : String(fieldVal ?? "") === wanted;
        if (!matches) return false;
      }
      if (!search) return true;
      const positions = Array.isArray(v.position4in1) ? v.position4in1 : [v.position4in1].filter(Boolean);
      const haystack = `${v.name} ${v.phone || ""} ${v.email || ""} ${(v.skills || []).join(" ")} ${v.address || ""} ${positions.join(" ")} ${v.positionOther || ""} ${v.jobTitle || ""} ${v.mentorName || ""}`;
      return chineseIncludes(haystack, search);
    });
  }, [volunteers, search, activeFilterKeys, filterValues]);

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

  const openAddGuest = () => {
    setEditingGuest(null);
    setShowGuestForm(true);
  };

  const openEditGuest = (guest) => {
    setEditingGuest({
      id: guest.guestId || null,
      name: guest.name,
      phone: guest.phone,
      area: guest.area,
      inviterName: guest.inviterName,
      inviterPhone: guest.inviterPhone,
      notes: guest.notes,
    });
    setShowGuestForm(true);
  };

  const handleGuestSubmit = async (data) => {
    if (editingGuest?.id) {
      await updateGuest(editingGuest.id, data);
    } else {
      await createGuest(data);
    }
    setShowGuestForm(false);
  };

  const handleDeleteGuest = async () => {
    if (deletingGuest.guestId) {
      await removeGuest(deletingGuest.guestId);
    } else {
      const ref = await createGuest({
        name: deletingGuest.name,
        phone: deletingGuest.phone,
        area: deletingGuest.area,
        inviterName: deletingGuest.inviterName || "",
        inviterPhone: deletingGuest.inviterPhone || "",
        notes: deletingGuest.notes || "",
      });
      await removeGuest(ref.id);
    }
    setDeletingGuest(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-black italic text-slate-800">{dbMode === "guest" ? "大德資料庫" : "志工資料庫"}</h2>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode("card")}
              className={`p-3 transition-colors ${viewMode === "card" ? "bg-indigo-600 text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}
              title="卡片式"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 transition-colors ${viewMode === "list" ? "bg-indigo-600 text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}
              title="排列式"
            >
              <List size={18} />
            </button>
          </div>
          {dbMode === "volunteer" && (
            <Button variant="secondary" icon={Upload} onClick={() => setShowImport(true)}>匯入 Excel</Button>
          )}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setDbMode("volunteer")}
              className={`px-4 py-3 text-sm font-bold transition-colors ${dbMode === "volunteer" ? "bg-indigo-600 text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}
            >
              志工
            </button>
            <button
              onClick={() => setDbMode("guest")}
              className={`px-4 py-3 text-sm font-bold transition-colors ${dbMode === "guest" ? "bg-indigo-600 text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}
            >
              大德
            </button>
          </div>
          {dbMode === "volunteer" && (
            <Button icon={Plus} onClick={openCreate}>新增志工</Button>
          )}
        </div>
      </div>

      {dbMode === "guest" ? (
        <GuestDirectory
          registrations={registrations}
          events={events}
          guests={guests}
          isAdmin={isAdmin}
          viewMode={viewMode}
          onAdd={openAddGuest}
          onImport={() => setShowGuestImport(true)}
          onView={setViewingGuest}
          onEdit={openEditGuest}
          onDelete={setDeletingGuest}
        />
      ) : (
        <>
          <VolunteerFilterBar
            search={search}
            onSearch={setSearch}
            activeFilterKeys={activeFilterKeys}
            filterValues={filterValues}
            onFilterChange={setFilterValue}
            fieldOptionsMap={fieldOptionsMap}
            onOpenFieldPicker={() => setShowFieldPicker(true)}
          />

          {loading ? (
            <div className="text-center py-16 text-slate-400 italic">載入中...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="還沒有志工資料"
              description="點選「新增志工」開始建立團隊的志工資料庫。"
              action={<Button icon={Plus} onClick={openCreate}>新增志工</Button>}
            />
          ) : viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((v) => (
                <VolunteerCard
                  key={v.id}
                  volunteer={v}
                  isAdmin={isAdmin}
                  onView={setViewing}
                  onEdit={openEdit}
                  onDelete={setDeleting}
                />
              ))}
            </div>
          ) : (
            <VolunteerListView
              volunteers={filtered}
              isAdmin={isAdmin}
              onView={setViewing}
              onEdit={openEdit}
              onDelete={setDeleting}
              registrations={registrations}
              events={events}
            />
          )}
        </>
      )}

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="志工資料"
        footer={
          <Button
            icon={Pencil}
            onClick={() => {
              openEdit(viewing);
              setViewing(null);
            }}
          >
            編輯
          </Button>
        }
      >
        {viewing && <VolunteerDetail volunteer={viewing} />}
      </Modal>

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

      <Modal open={showImport} onClose={() => setShowImport(false)} title="匯入 Excel">
        <VolunteerImportModal onImport={create} onUpdate={update} existingVolunteers={volunteers} onClose={() => setShowImport(false)} />
      </Modal>

      <Modal open={showFieldPicker} onClose={() => setShowFieldPicker(false)} title="自訂篩選欄位">
        <FilterFieldPicker
          fields={VOLUNTEER_FILTER_FIELDS}
          selected={activeFilterKeys}
          onSave={(keys) => {
            setActiveFilterKeys(keys);
            setShowFieldPicker(false);
          }}
          onCancel={() => setShowFieldPicker(false)}
        />
      </Modal>

      <Modal
        open={!!viewingGuest}
        onClose={() => setViewingGuest(null)}
        title="大德資料"
        footer={
          <Button
            icon={Pencil}
            onClick={() => {
              openEditGuest(viewingGuest);
              setViewingGuest(null);
            }}
          >
            編輯
          </Button>
        }
      >
        {viewingGuest && <GuestDetail guest={viewingGuest} />}
      </Modal>

      <Modal open={showGuestForm} onClose={() => setShowGuestForm(false)} title={editingGuest ? "編輯大德資料" : "新增大德資料"}>
        <GuestForm
          initial={editingGuest}
          onSubmit={handleGuestSubmit}
          onCancel={() => setShowGuestForm(false)}
        />
      </Modal>

      <Modal open={showGuestImport} onClose={() => setShowGuestImport(false)} title="匯入 Excel">
        <GuestImportModal onImport={createGuest} onClose={() => setShowGuestImport(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deletingGuest}
        onClose={() => setDeletingGuest(null)}
        onConfirm={handleDeleteGuest}
        message={deletingGuest ? `確定要刪除大德「${deletingGuest.name}」的資料嗎？` : ""}
      />
    </div>
  );
}
