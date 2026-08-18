import { useEffect, useMemo, useState } from "react";
import { Settings2, Download } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useGuestDirectory } from "../../hooks/useGuestDirectory";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import ReportTable from "../../components/ui/ReportTable";
import { FUNDRAISING_COLUMNS, DEFAULT_FUNDRAISING_COLUMN_KEYS } from "../../constants/fundraisingColumns";
import { exportRowsToExcel } from "../../lib/exportExcel";

const COLUMNS_STORAGE_KEY = "team-ops:fundraising:columns";

function loadStoredKeys() {
  const validKeys = new Set(FUNDRAISING_COLUMNS.map((c) => c.key));
  try {
    const stored = JSON.parse(localStorage.getItem(COLUMNS_STORAGE_KEY));
    if (Array.isArray(stored)) {
      const filtered = stored.filter((k) => validKeys.has(k));
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // ignore malformed storage
  }
  return DEFAULT_FUNDRAISING_COLUMN_KEYS;
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

export default function FundraisingPage() {
  const { data: volunteers, loading: loadingVolunteers } = useCollection("volunteers");
  const { data: guestDocs, loading: loadingGuests } = useCollection("guests");
  const { data: registrations, loading: loadingRegs } = useCollection("registrations");
  const { data: events, loading: loadingEvents } = useCollection("events", { includeDeleted: true });

  const [activeColumnKeys, setActiveColumnKeys] = useState(loadStoredKeys);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [heQi, setHeQi] = useState("all");
  const [huAi, setHuAi] = useState("all");
  const [xieLi, setXieLi] = useState("all");

  useEffect(() => {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(activeColumnKeys));
  }, [activeColumnKeys]);

  const guests = useGuestDirectory({ registrations, events, guestDocs });

  const people = useMemo(() => {
    const volunteerRows = volunteers.map((v) => ({
      id: `v:${v.id}`,
      category: "志工",
      name: v.name,
      phone: v.phone || "",
      tcIdentification: v.tcIdentification || "",
      heQi: v.heQi || "",
      huAi: v.huAi || "",
      xieLi: v.xieLi || "",
      area: v.address || "",
      notes: v.notes || "",
    }));
    const guestRows = guests.map((g) => ({
      id: `g:${g.key}`,
      category: "大德",
      name: g.name,
      phone: g.phone || "",
      tcIdentification: g.tcIdentification || "",
      heQi: "",
      huAi: "",
      xieLi: "",
      area: g.area || "",
      notes: g.notes || "",
    }));
    return [...volunteerRows, ...guestRows];
  }, [volunteers, guests]);

  const heQiOptions = useMemo(() => uniqueSorted(volunteers.map((v) => v.heQi)), [volunteers]);
  const huAiOptions = useMemo(() => uniqueSorted(volunteers.map((v) => v.huAi)), [volunteers]);
  const xieLiOptions = useMemo(() => uniqueSorted(volunteers.map((v) => v.xieLi)), [volunteers]);

  const columns = useMemo(
    () => FUNDRAISING_COLUMNS.filter((c) => activeColumnKeys.includes(c.key)),
    [activeColumnKeys]
  );

  const rows = useMemo(() => {
    return people.filter((p) => {
      if (heQi !== "all" && p.heQi !== heQi) return false;
      if (huAi !== "all" && p.huAi !== huAi) return false;
      if (xieLi !== "all" && p.xieLi !== xieLi) return false;
      return true;
    });
  }, [people, heQi, huAi, xieLi]);

  const loading = loadingVolunteers || loadingGuests || loadingRegs || loadingEvents;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-black italic text-slate-800">募款募心</h2>
          <p className="text-sm text-slate-500 mt-1">志工與大德資料庫彙整，可依和氣、互愛、協力分別篩選。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Settings2} onClick={() => setShowColumnPicker(true)}>選擇欄位</Button>
          <Button icon={Download} onClick={() => exportRowsToExcel("募款募心名單.xlsx", columns, rows)}>匯出 Excel</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
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

      <Modal open={showColumnPicker} onClose={() => setShowColumnPicker(false)} title="選擇要顯示的欄位">
        <FilterFieldPicker
          fields={FUNDRAISING_COLUMNS}
          selected={activeColumnKeys}
          max={FUNDRAISING_COLUMNS.length}
          description="選擇要顯示的欄位。"
          onSave={(keys) => { setActiveColumnKeys(keys); setShowColumnPicker(false); }}
          onCancel={() => setShowColumnPicker(false)}
        />
      </Modal>
    </div>
  );
}
