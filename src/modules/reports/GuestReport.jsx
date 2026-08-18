import { useEffect, useMemo, useState } from "react";
import { Settings2, Download } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useGuestDirectory } from "../../hooks/useGuestDirectory";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import ReportTable from "../../components/ui/ReportTable";
import { GUEST_REPORT_COLUMNS, DEFAULT_GUEST_REPORT_KEYS } from "../../constants/reportColumns";
import { exportRowsToExcel } from "../../lib/exportExcel";

const STORAGE_KEY = "team-ops:report:guestColumns";

function loadStoredKeys() {
  const validKeys = new Set(GUEST_REPORT_COLUMNS.map((c) => c.key));
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored)) {
      const filtered = stored.filter((k) => validKeys.has(k));
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // ignore malformed storage
  }
  return DEFAULT_GUEST_REPORT_KEYS;
}

export default function GuestReport() {
  const { data: guestDocs, loading: loadingGuests } = useCollection("guests");
  const { data: registrations, loading: loadingRegs } = useCollection("registrations");
  const { data: events, loading: loadingEvents } = useCollection("events", { includeDeleted: true });
  const [activeKeys, setActiveKeys] = useState(loadStoredKeys);
  const [showPicker, setShowPicker] = useState(false);
  const [attended, setAttended] = useState("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeKeys));
  }, [activeKeys]);

  const guests = useGuestDirectory({ registrations, events, guestDocs });

  const columns = useMemo(
    () => GUEST_REPORT_COLUMNS.filter((c) => activeKeys.includes(c.key)),
    [activeKeys]
  );

  const rows = useMemo(() => {
    return guests.filter((g) => {
      if (attended === "yes" && !g.attended) return false;
      if (attended === "no" && g.attended) return false;
      return true;
    });
  }, [guests, attended]);

  const loading = loadingGuests || loadingRegs || loadingEvents;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-black italic text-slate-800">大德資料庫報表</h3>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Settings2} onClick={() => setShowPicker(true)}>選擇欄位</Button>
          <Button icon={Download} onClick={() => exportRowsToExcel("大德資料庫報表.xlsx", columns, rows)}>匯出 Excel</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={attended} onChange={(e) => setAttended(e.target.value)} className="sm:w-48">
          <option value="all">全部（曾出席/未出席）</option>
          <option value="yes">曾出席</option>
          <option value="no">未曾出席</option>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : (
        <ReportTable columns={columns} rows={rows} />
      )}

      <Modal open={showPicker} onClose={() => setShowPicker(false)} title="選擇要顯示的欄位">
        <FilterFieldPicker
          fields={GUEST_REPORT_COLUMNS}
          selected={activeKeys}
          max={GUEST_REPORT_COLUMNS.length}
          description="選擇要顯示在報表裡的欄位。"
          onSave={(keys) => { setActiveKeys(keys); setShowPicker(false); }}
          onCancel={() => setShowPicker(false)}
        />
      </Modal>
    </div>
  );
}
