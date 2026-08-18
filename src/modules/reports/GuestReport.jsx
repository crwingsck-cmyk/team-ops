import { useEffect, useMemo, useState } from "react";
import { Settings2, Download, Table2, LayoutGrid } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useGuestDirectory } from "../../hooks/useGuestDirectory";
import Button from "../../components/ui/Button";
import MultiSelectFilter from "../../components/ui/MultiSelectFilter";
import Modal from "../../components/ui/Modal";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import ReportTable from "../../components/ui/ReportTable";
import SearchableRecordCardGrid from "../../components/ui/SearchableRecordCardGrid";
import FieldTallyGrid from "../../components/ui/FieldTallyGrid";
import GuestEventParticipationGrid from "./GuestEventParticipationGrid";
import { GUEST_REPORT_COLUMNS, DEFAULT_GUEST_REPORT_KEYS } from "../../constants/reportColumns";
import { GUEST_FILTER_FIELDS, DEFAULT_GUEST_FILTER_KEYS, guestFilterOptionLabel } from "../../constants/guestFilterFields";
import { TC_IDENTIFICATION_LABELS } from "../../constants/categoryStyles";
import { exportRowsToExcel } from "../../lib/exportExcel";

const TALLY_FIELDS = [
  { key: "area", label: "居住地區", source: "dynamic" },
  { key: "tcIdentification", label: "慈濟身份", source: "enum", enumOptions: TC_IDENTIFICATION_LABELS },
];

const COLUMNS_STORAGE_KEY = "team-ops:report:guestColumns";
const FILTER_KEYS_STORAGE_KEY = "team-ops:report:guestFilterKeys";

function loadStoredKeys(storageKey, validKeys, fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(stored)) {
      const filtered = stored.filter((k) => validKeys.has(k));
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // ignore malformed storage
  }
  return fallback;
}

export default function GuestReport() {
  const { data: guestDocs, loading: loadingGuests } = useCollection("guests");
  const { data: registrations, loading: loadingRegs } = useCollection("registrations");
  const { data: events, loading: loadingEvents } = useCollection("events", { includeDeleted: true });
  const [activeColumnKeys, setActiveColumnKeys] = useState(() =>
    loadStoredKeys(COLUMNS_STORAGE_KEY, new Set(GUEST_REPORT_COLUMNS.map((c) => c.key)), DEFAULT_GUEST_REPORT_KEYS)
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [activeFilterKeys, setActiveFilterKeys] = useState(() =>
    loadStoredKeys(FILTER_KEYS_STORAGE_KEY, new Set(GUEST_FILTER_FIELDS.map((f) => f.key)), DEFAULT_GUEST_FILTER_KEYS)
  );
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(GUEST_FILTER_FIELDS.map((f) => [f.key, []]))
  );
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const [viewMode, setViewMode] = useState("card");

  useEffect(() => {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(activeColumnKeys));
  }, [activeColumnKeys]);

  useEffect(() => {
    localStorage.setItem(FILTER_KEYS_STORAGE_KEY, JSON.stringify(activeFilterKeys));
  }, [activeFilterKeys]);

  const setFilterValue = (key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }));

  const guests = useGuestDirectory({ registrations, events, guestDocs });

  const fieldOptionsMap = useMemo(() => {
    const map = {};
    GUEST_FILTER_FIELDS.forEach((field) => {
      if (field.source === "enum") {
        map[field.key] = Object.keys(field.enumOptions).map((k) => ({
          value: k,
          label: guestFilterOptionLabel(field, k),
        }));
        return;
      }
      const set = new Set();
      guests.forEach((g) => {
        const raw = g[field.key];
        const values = field.source === "dynamicArray" ? (Array.isArray(raw) ? raw : []) : (raw ? [String(raw)] : []);
        values.forEach((v) => v && set.add(v));
      });
      map[field.key] = [...set].sort().map((v) => ({ value: v, label: v }));
    });
    return map;
  }, [guests]);

  const columns = useMemo(
    () => GUEST_REPORT_COLUMNS.filter((c) => activeColumnKeys.includes(c.key)),
    [activeColumnKeys]
  );

  const rows = useMemo(() => {
    return guests.filter((g) => {
      for (const key of activeFilterKeys) {
        const wanted = filterValues[key] || [];
        if (wanted.length === 0) continue;
        const fieldVal = g[key];
        const matches = Array.isArray(fieldVal)
          ? fieldVal.some((fv) => wanted.includes(fv))
          : wanted.includes(String(fieldVal ?? ""));
        if (!matches) return false;
      }
      return true;
    });
  }, [guests, activeFilterKeys, filterValues]);

  const loading = loadingGuests || loadingRegs || loadingEvents;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-black italic text-slate-800">大德資料庫報表</h3>
        <div className="flex gap-2">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2.5 transition-colors ${viewMode === "card" ? "bg-indigo-600 text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}
              title="卡片檢視"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2.5 transition-colors ${viewMode === "table" ? "bg-indigo-600 text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}
              title="表格檢視"
            >
              <Table2 size={18} />
            </button>
          </div>
          <Button variant="secondary" icon={Settings2} onClick={() => setShowColumnPicker(true)}>選擇欄位</Button>
          <Button icon={Download} onClick={() => exportRowsToExcel("大德資料庫報表.xlsx", columns, rows)}>匯出 Excel</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {activeFilterKeys.map((key) => {
          const field = GUEST_FILTER_FIELDS.find((f) => f.key === key);
          if (!field) return null;
          return (
            <MultiSelectFilter
              key={key}
              label={field.label}
              options={fieldOptionsMap[key] || []}
              selected={filterValues[key] || []}
              onChange={(vals) => setFilterValue(key, vals)}
              className="sm:w-44"
            />
          );
        })}
        <button
          onClick={() => setShowFilterPicker(true)}
          className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all"
          title="自訂篩選欄位"
        >
          <Settings2 size={18} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : viewMode === "card" ? (
        <>
          <p className="text-sm font-bold text-slate-500 mb-3">統籌總覽</p>
          <FieldTallyGrid fields={TALLY_FIELDS} rows={rows} />
          <p className="text-sm font-bold text-slate-500 mt-8 mb-3">各活動參與大德人數</p>
          <GuestEventParticipationGrid guests={rows} events={events} />
          <p className="text-sm font-bold text-slate-500 mt-8 mb-3">個人卡片</p>
          <SearchableRecordCardGrid columns={columns} rows={rows} />
        </>
      ) : (
        <ReportTable columns={columns} rows={rows} />
      )}

      <Modal open={showColumnPicker} onClose={() => setShowColumnPicker(false)} title="選擇要顯示的欄位">
        <FilterFieldPicker
          fields={GUEST_REPORT_COLUMNS}
          selected={activeColumnKeys}
          max={GUEST_REPORT_COLUMNS.length}
          description="選擇要顯示在報表裡的欄位。"
          onSave={(keys) => { setActiveColumnKeys(keys); setShowColumnPicker(false); }}
          onCancel={() => setShowColumnPicker(false)}
        />
      </Modal>

      <Modal open={showFilterPicker} onClose={() => setShowFilterPicker(false)} title="自訂篩選欄位">
        <FilterFieldPicker
          fields={GUEST_FILTER_FIELDS}
          selected={activeFilterKeys}
          max={GUEST_FILTER_FIELDS.length}
          description="選擇要用來篩選資料的欄位。"
          onSave={(keys) => { setActiveFilterKeys(keys); setShowFilterPicker(false); }}
          onCancel={() => setShowFilterPicker(false)}
        />
      </Modal>
    </div>
  );
}
