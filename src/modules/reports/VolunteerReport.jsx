import { useEffect, useMemo, useState } from "react";
import { Settings2, Download } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import ReportTable from "../../components/ui/ReportTable";
import { VOLUNTEER_REPORT_COLUMNS, DEFAULT_VOLUNTEER_REPORT_KEYS } from "../../constants/reportColumns";
import { VOLUNTEER_STATUS, TC_IDENTIFICATION_LABELS } from "../../constants/categoryStyles";
import { exportRowsToExcel } from "../../lib/exportExcel";

const STORAGE_KEY = "team-ops:report:volunteerColumns";

function loadStoredKeys() {
  const validKeys = new Set(VOLUNTEER_REPORT_COLUMNS.map((c) => c.key));
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored)) {
      const filtered = stored.filter((k) => validKeys.has(k));
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // ignore malformed storage
  }
  return DEFAULT_VOLUNTEER_REPORT_KEYS;
}

export default function VolunteerReport() {
  const { data: volunteers, loading } = useCollection("volunteers");
  const [activeKeys, setActiveKeys] = useState(loadStoredKeys);
  const [showPicker, setShowPicker] = useState(false);
  const [status, setStatus] = useState("all");
  const [tcIdentification, setTcIdentification] = useState("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeKeys));
  }, [activeKeys]);

  const columns = useMemo(
    () => VOLUNTEER_REPORT_COLUMNS.filter((c) => activeKeys.includes(c.key)),
    [activeKeys]
  );

  const rows = useMemo(() => {
    return volunteers.filter((v) => {
      if (status !== "all" && v.status !== status) return false;
      if (tcIdentification !== "all" && v.tcIdentification !== tcIdentification) return false;
      return true;
    });
  }, [volunteers, status, tcIdentification]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-black italic text-slate-800">志工資料庫報表</h3>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Settings2} onClick={() => setShowPicker(true)}>選擇欄位</Button>
          <Button icon={Download} onClick={() => exportRowsToExcel("志工資料庫報表.xlsx", columns, rows)}>匯出 Excel</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-48">
          <option value="all">全部狀態</option>
          {Object.entries(VOLUNTEER_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
        <Select value={tcIdentification} onChange={(e) => setTcIdentification(e.target.value)} className="sm:w-48">
          <option value="all">全部慈濟身份</option>
          {Object.entries(TC_IDENTIFICATION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.split(" ")[0]}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : (
        <ReportTable columns={columns} rows={rows} />
      )}

      <Modal open={showPicker} onClose={() => setShowPicker(false)} title="選擇要顯示的欄位">
        <FilterFieldPicker
          fields={VOLUNTEER_REPORT_COLUMNS}
          selected={activeKeys}
          max={VOLUNTEER_REPORT_COLUMNS.length}
          description="選擇要顯示在報表裡的欄位。"
          onSave={(keys) => { setActiveKeys(keys); setShowPicker(false); }}
          onCancel={() => setShowPicker(false)}
        />
      </Modal>
    </div>
  );
}
