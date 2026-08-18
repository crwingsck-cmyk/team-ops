import { useEffect, useMemo, useState } from "react";
import { Settings2, Download, Table2, LayoutGrid } from "lucide-react";
import { useFundraisingPeople } from "../../hooks/useFundraisingPeople";
import { useCollection } from "../../hooks/useCollection";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import ReportTable from "../../components/ui/ReportTable";
import FundraisingCardGrid from "./FundraisingCardGrid";
import { FUNDRAISING_COLUMNS, DEFAULT_FUNDRAISING_COLUMN_KEYS, flattenDonorRows } from "../../constants/fundraisingColumns";
import { exportRowsToExcel } from "../../lib/exportExcel";

const STORAGE_KEY = "team-ops:report:fundraisingColumns";

const GROUP_MODES = [
  { key: "heQi", label: "和氣" },
  { key: "huAi", label: "互愛" },
  { key: "xieLi", label: "協力" },
  { key: "person", label: "個人" },
  { key: "event", label: "活動" },
];

function loadStoredKeys() {
  const validKeys = new Set(FUNDRAISING_COLUMNS.map((c) => c.key));
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored)) {
      const filtered = stored.filter((k) => validKeys.has(k));
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // ignore malformed storage
  }
  return DEFAULT_FUNDRAISING_COLUMN_KEYS;
}

export default function FundraisingReport() {
  const { people, heQiOptions, huAiOptions, xieLiOptions, loading } = useFundraisingPeople();
  const { data: events, loading: loadingEvents } = useCollection("fundraisingEvents", { orderByField: "date", orderByDirection: "desc" });
  const [activeKeys, setActiveKeys] = useState(loadStoredKeys);
  const [showPicker, setShowPicker] = useState(false);
  const [heQi, setHeQi] = useState("all");
  const [huAi, setHuAi] = useState("all");
  const [xieLi, setXieLi] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [groupMode, setGroupMode] = useState("heQi");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeKeys));
  }, [activeKeys]);

  const columns = useMemo(
    () => FUNDRAISING_COLUMNS.filter((c) => activeKeys.includes(c.key)),
    [activeKeys]
  );

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      if (heQi !== "all" && p.heQi !== heQi) return false;
      if (huAi !== "all" && p.huAi !== huAi) return false;
      if (xieLi !== "all" && p.xieLi !== xieLi) return false;
      return true;
    });
  }, [people, heQi, huAi, xieLi]);

  const rows = useMemo(() => flattenDonorRows(filteredPeople), [filteredPeople]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-black italic text-slate-800">募款募心報表</h3>
        <div className="flex gap-2">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2.5 transition-colors ${viewMode === "table" ? "bg-indigo-600 text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}
              title="表格檢視"
            >
              <Table2 size={18} />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-2.5 transition-colors ${viewMode === "card" ? "bg-indigo-600 text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}
              title="卡片檢視"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          {viewMode === "table" && (
            <>
              <Button variant="secondary" icon={Settings2} onClick={() => setShowPicker(true)}>選擇欄位</Button>
              <Button icon={Download} onClick={() => exportRowsToExcel("募款募心報表.xlsx", columns, rows)}>匯出 Excel</Button>
            </>
          )}
        </div>
      </div>

      {viewMode === "card" ? (
        <>
          <div className="flex flex-wrap gap-3 mb-6">
            <Select value={groupMode} onChange={(e) => setGroupMode(e.target.value)} className="sm:w-44">
              {GROUP_MODES.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </Select>
          </div>
          {loading || loadingEvents ? (
            <div className="text-center py-16 text-slate-400 italic">載入中...</div>
          ) : (
            <FundraisingCardGrid groupMode={groupMode} people={people} events={events} />
          )}
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-6">
            <Select value={heQi} onChange={(e) => setHeQi(e.target.value)} className="sm:w-44">
              <option value="all">全部和氣</option>
              {heQiOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>
            <Select value={huAi} onChange={(e) => setHuAi(e.target.value)} className="sm:w-44">
              <option value="all">全部互愛</option>
              {huAiOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>
            <Select value={xieLi} onChange={(e) => setXieLi(e.target.value)} className="sm:w-44">
              <option value="all">全部協力</option>
              {xieLiOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400 italic">載入中...</div>
          ) : (
            <ReportTable columns={columns} rows={rows} />
          )}
        </>
      )}

      <Modal open={showPicker} onClose={() => setShowPicker(false)} title="選擇要顯示的欄位">
        <FilterFieldPicker
          fields={FUNDRAISING_COLUMNS}
          selected={activeKeys}
          max={FUNDRAISING_COLUMNS.length}
          description="選擇要顯示在報表裡的欄位。"
          onSave={(keys) => { setActiveKeys(keys); setShowPicker(false); }}
          onCancel={() => setShowPicker(false)}
        />
      </Modal>
    </div>
  );
}
