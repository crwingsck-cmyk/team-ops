import { useEffect, useMemo, useState } from "react";
import { Plus, Users, Upload, LayoutGrid, List } from "lucide-react";
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
import VolunteerFilterBar from "./VolunteerFilterBar";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import VolunteerImportModal from "./VolunteerImportModal";
import { VOLUNTEER_FILTER_FIELDS, DEFAULT_VOLUNTEER_FILTER_KEYS, volunteerFilterOptionLabel } from "../../constants/volunteerFilterFields";
import { chineseIncludes } from "../../lib/chineseSearch";

const FILTER_KEYS_STORAGE_KEY = "team-ops:volunteerFilterKeys";

function loadStoredFilterKeys() {
  const validKeys = new Set(VOLUNTEER_FILTER_FIELDS.map((f) => f.key));
  try {
    const stored = JSON.parse(localStorage.getItem(FILTER_KEYS_STORAGE_KEY));
    if (Array.isArray(stored)) {
      const filtered = stored.filter((k) => validKeys.has(k)).slice(0, 3);
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // ignore malformed storage
  }
  return DEFAULT_VOLUNTEER_FILTER_KEYS;
}

export default function VolunteersPage() {
  const { data: volunteers, loading } = useCollection("volunteers");
  const { create, update, remove } = useFirestoreCrud("volunteers");
  const { isAdmin } = useMembership();

  const [search, setSearch] = useState("");
  const [activeFilterKeys, setActiveFilterKeys] = useState(loadStoredFilterKeys);
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(VOLUNTEER_FILTER_FIELDS.map((f) => [f.key, "all"]))
  );
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showImport, setShowImport] = useState(false);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black italic text-slate-800">志工資料庫</h2>
        <div className="flex gap-2">
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
          <Button variant="secondary" icon={Upload} onClick={() => setShowImport(true)}>匯入 Excel</Button>
          <Button icon={Plus} onClick={openCreate}>新增志工</Button>
        </div>
      </div>

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
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          ))}
        </div>
      ) : (
        <VolunteerListView
          volunteers={filtered}
          isAdmin={isAdmin}
          onEdit={openEdit}
          onDelete={setDeleting}
        />
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

      <Modal open={showImport} onClose={() => setShowImport(false)} title="匯入 Excel">
        <VolunteerImportModal onImport={create} onClose={() => setShowImport(false)} />
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
    </div>
  );
}
