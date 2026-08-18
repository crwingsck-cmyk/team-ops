import { useEffect, useMemo, useState } from "react";
import { Settings2, Download, Table2, LayoutGrid } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import ReportTable from "../../components/ui/ReportTable";
import SearchableRecordCardGrid from "../../components/ui/SearchableRecordCardGrid";
import EventAttendanceSummaryGrid from "./EventAttendanceSummaryGrid";
import { ATTENDANCE_REPORT_COLUMNS, DEFAULT_ATTENDANCE_REPORT_KEYS } from "../../constants/reportColumns";
import { REGISTRATION_STATUS } from "../../constants/categoryStyles";
import { eventFirstDate, dateRangeText } from "../../lib/eventDays";
import { exportRowsToExcel } from "../../lib/exportExcel";

const STORAGE_KEY = "team-ops:report:attendanceColumns";

function loadStoredKeys() {
  const validKeys = new Set(ATTENDANCE_REPORT_COLUMNS.map((c) => c.key));
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored)) {
      const filtered = stored.filter((k) => validKeys.has(k));
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // ignore malformed storage
  }
  return DEFAULT_ATTENDANCE_REPORT_KEYS;
}

export default function AttendanceReport() {
  const { data: registrations, loading: loadingRegs } = useCollection("registrations");
  const { data: events, loading: loadingEvents } = useCollection("events", { includeDeleted: true });
  const [activeKeys, setActiveKeys] = useState(loadStoredKeys);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [status, setStatus] = useState("all");
  const [attended, setAttended] = useState("all");
  const [viewMode, setViewMode] = useState("card");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeKeys));
  }, [activeKeys]);

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const sortedEvents = useMemo(
    () => events.slice().sort((a, b) => eventFirstDate(b).localeCompare(eventFirstDate(a))),
    [events]
  );

  const summaryEvents = useMemo(
    () => (selectedEventId ? sortedEvents.filter((e) => e.id === selectedEventId) : sortedEvents),
    [sortedEvents, selectedEventId]
  );

  const columns = useMemo(
    () => ATTENDANCE_REPORT_COLUMNS.filter((c) => activeKeys.includes(c.key)),
    [activeKeys]
  );

  const rows = useMemo(() => {
    return registrations
      .filter((r) => {
        if (selectedEventId && r.eventId !== selectedEventId) return false;
        if (status !== "all" && r.status !== status) return false;
        if (attended === "yes" && !r.attended) return false;
        if (attended === "no" && r.attended) return false;
        return true;
      })
      .map((r) => {
        const event = eventsById.get(r.eventId);
        return {
          ...r,
          eventTitle: event?.title || r.eventTitle || "（活動已刪除）",
          eventDateDisplay: event ? dateRangeText(event) : r.eventDate,
        };
      });
  }, [registrations, eventsById, selectedEventId, status, attended]);

  const loading = loadingRegs || loadingEvents;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-black italic text-slate-800">活動報名與出席報表</h3>
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
          <Button variant="secondary" icon={Settings2} onClick={() => setShowPicker(true)}>選擇欄位</Button>
          <Button icon={Download} onClick={() => exportRowsToExcel("活動報名與出席報表.xlsx", columns, rows)}>匯出 Excel</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="sm:w-64">
          <option value="">全部活動</option>
          {sortedEvents.map((e) => (
            <option key={e.id} value={e.id}>{dateRangeText(e)} · {e.title}{e.deletedAt ? "（已刪除）" : ""}</option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-40">
          <option value="all">全部報名狀態</option>
          {Object.entries(REGISTRATION_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
        <Select value={attended} onChange={(e) => setAttended(e.target.value)} className="sm:w-40">
          <option value="all">全部出席狀態</option>
          <option value="yes">已出席</option>
          <option value="no">未出席</option>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : viewMode === "card" ? (
        <>
          <p className="text-sm font-bold text-slate-500 mb-3">活動總覽</p>
          <EventAttendanceSummaryGrid events={summaryEvents} registrations={registrations} />
          <p className="text-sm font-bold text-slate-500 mt-8 mb-3">個人參與活動</p>
          <SearchableRecordCardGrid columns={columns} rows={rows} />
        </>
      ) : (
        <ReportTable columns={columns} rows={rows} />
      )}

      <Modal open={showPicker} onClose={() => setShowPicker(false)} title="選擇要顯示的欄位">
        <FilterFieldPicker
          fields={ATTENDANCE_REPORT_COLUMNS}
          selected={activeKeys}
          max={ATTENDANCE_REPORT_COLUMNS.length}
          description="選擇要顯示在報表裡的欄位。"
          onSave={(keys) => { setActiveKeys(keys); setShowPicker(false); }}
          onCancel={() => setShowPicker(false)}
        />
      </Modal>
    </div>
  );
}
