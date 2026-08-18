import { useEffect, useMemo, useState } from "react";
import { Settings2, Download, Table2, LayoutGrid } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import ReportTable from "../../components/ui/ReportTable";
import RecordCardGrid from "../../components/ui/RecordCardGrid";
import FieldTallyGrid from "../../components/ui/FieldTallyGrid";
import { VOLUNTEER_REPORT_COLUMNS, DEFAULT_VOLUNTEER_REPORT_KEYS } from "../../constants/reportColumns";
import { VOLUNTEER_FILTER_FIELDS, DEFAULT_VOLUNTEER_FILTER_KEYS, volunteerFilterOptionLabel } from "../../constants/volunteerFilterFields";
import {
  VOLUNTEER_STATUS,
  TC_IDENTIFICATION_LABELS,
  MARITAL_STATUS_LABELS,
  WORK_SCHEDULE_LABELS,
  CAR_SEATS_LABELS,
  MISSION_BODY_LABELS,
  GENDER_LABELS,
} from "../../constants/categoryStyles";
import { exportRowsToExcel } from "../../lib/exportExcel";

const YES_NO = { yes: "是", no: "否" };

const TALLY_FIELDS = [
  { key: "heQi", label: "和氣", source: "dynamic" },
  { key: "huAi", label: "互愛", source: "dynamic" },
  { key: "xieLi", label: "協力", source: "dynamic" },
  { key: "gender", label: "性別", source: "enum", enumOptions: GENDER_LABELS },
  { key: "status", label: "狀態", source: "enum", enumOptions: VOLUNTEER_STATUS },
  { key: "tcIdentification", label: "慈濟身份", source: "enum", enumOptions: TC_IDENTIFICATION_LABELS },
  { key: "maritalStatus", label: "婚姻狀態", source: "enum", enumOptions: MARITAL_STATUS_LABELS },
  { key: "workSchedule", label: "上班時間", source: "enum", enumOptions: WORK_SCHEDULE_LABELS },
  { key: "carSeats", label: "車子座位數", source: "enum", enumOptions: CAR_SEATS_LABELS },
  { key: "canDrive", label: "是否會開車", source: "enum", enumOptions: YES_NO },
  { key: "missionBody", label: "志業體", source: "enum", enumOptions: MISSION_BODY_LABELS },
  { key: "usesFamilyTreasure", label: "是否使用傳家寶", source: "enum", enumOptions: YES_NO },
  { key: "position4in1", label: "四合一崗位", source: "dynamicArray" },
];

const COLUMNS_STORAGE_KEY = "team-ops:report:volunteerColumns";
const FILTER_KEYS_STORAGE_KEY = "team-ops:report:volunteerFilterKeys";

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

export default function VolunteerReport() {
  const { data: volunteers, loading } = useCollection("volunteers");
  const [activeColumnKeys, setActiveColumnKeys] = useState(() =>
    loadStoredKeys(COLUMNS_STORAGE_KEY, new Set(VOLUNTEER_REPORT_COLUMNS.map((c) => c.key)), DEFAULT_VOLUNTEER_REPORT_KEYS)
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [activeFilterKeys, setActiveFilterKeys] = useState(() =>
    loadStoredKeys(FILTER_KEYS_STORAGE_KEY, new Set(VOLUNTEER_FILTER_FIELDS.map((f) => f.key)), DEFAULT_VOLUNTEER_FILTER_KEYS)
  );
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(VOLUNTEER_FILTER_FIELDS.map((f) => [f.key, "all"]))
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

  const columns = useMemo(
    () => VOLUNTEER_REPORT_COLUMNS.filter((c) => activeColumnKeys.includes(c.key)),
    [activeColumnKeys]
  );

  const rows = useMemo(() => {
    return volunteers.filter((v) => {
      for (const key of activeFilterKeys) {
        const wanted = filterValues[key];
        if (!wanted || wanted === "all") continue;
        const fieldVal = v[key];
        const matches = Array.isArray(fieldVal) ? fieldVal.includes(wanted) : String(fieldVal ?? "") === wanted;
        if (!matches) return false;
      }
      return true;
    });
  }, [volunteers, activeFilterKeys, filterValues]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-black italic text-slate-800">志工資料庫報表</h3>
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
          <Button icon={Download} onClick={() => exportRowsToExcel("志工資料庫報表.xlsx", columns, rows)}>匯出 Excel</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {activeFilterKeys.map((key) => {
          const field = VOLUNTEER_FILTER_FIELDS.find((f) => f.key === key);
          if (!field) return null;
          return (
            <Select
              key={key}
              value={filterValues[key] || "all"}
              onChange={(e) => setFilterValue(key, e.target.value)}
              className="sm:w-44"
            >
              <option value="all">全部{field.label}</option>
              {(fieldOptionsMap[key] || []).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
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
          <p className="text-sm font-bold text-slate-500 mt-8 mb-3">個人卡片</p>
          <RecordCardGrid columns={columns} rows={rows} />
        </>
      ) : (
        <ReportTable columns={columns} rows={rows} />
      )}

      <Modal open={showColumnPicker} onClose={() => setShowColumnPicker(false)} title="選擇要顯示的欄位">
        <FilterFieldPicker
          fields={VOLUNTEER_REPORT_COLUMNS}
          selected={activeColumnKeys}
          max={VOLUNTEER_REPORT_COLUMNS.length}
          description="選擇要顯示在報表裡的欄位。"
          onSave={(keys) => { setActiveColumnKeys(keys); setShowColumnPicker(false); }}
          onCancel={() => setShowColumnPicker(false)}
        />
      </Modal>

      <Modal open={showFilterPicker} onClose={() => setShowFilterPicker(false)} title="自訂篩選欄位">
        <FilterFieldPicker
          fields={VOLUNTEER_FILTER_FIELDS}
          selected={activeFilterKeys}
          max={VOLUNTEER_FILTER_FIELDS.length}
          description="選擇要用來篩選資料的欄位。"
          onSave={(keys) => { setActiveFilterKeys(keys); setShowFilterPicker(false); }}
          onCancel={() => setShowFilterPicker(false)}
        />
      </Modal>
    </div>
  );
}
