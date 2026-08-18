import { useEffect, useMemo, useState } from "react";
import { Settings2, Download } from "lucide-react";
import { useFundraisingPeople } from "../../hooks/useFundraisingPeople";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import ReportTable from "../../components/ui/ReportTable";
import { FUNDRAISING_COLUMNS, DEFAULT_FUNDRAISING_COLUMN_KEYS, flattenDonorRows } from "../../constants/fundraisingColumns";
import { exportRowsToExcel } from "../../lib/exportExcel";

const STORAGE_KEY = "team-ops:report:fundraisingColumns";

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
  const [activeKeys, setActiveKeys] = useState(loadStoredKeys);
  const [showPicker, setShowPicker] = useState(false);
  const [heQi, setHeQi] = useState("all");
  const [huAi, setHuAi] = useState("all");
  const [xieLi, setXieLi] = useState("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeKeys));
  }, [activeKeys]);

  const columns = useMemo(
    () => FUNDRAISING_COLUMNS.filter((c) => activeKeys.includes(c.key)),
    [activeKeys]
  );

  const rows = useMemo(() => {
    const filtered = people.filter((p) => {
      if (heQi !== "all" && p.heQi !== heQi) return false;
      if (huAi !== "all" && p.huAi !== huAi) return false;
      if (xieLi !== "all" && p.xieLi !== xieLi) return false;
      return true;
    });
    return flattenDonorRows(filtered);
  }, [people, heQi, huAi, xieLi]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-black italic text-slate-800">募款募心報表</h3>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Settings2} onClick={() => setShowPicker(true)}>選擇欄位</Button>
          <Button icon={Download} onClick={() => exportRowsToExcel("募款募心報表.xlsx", columns, rows)}>匯出 Excel</Button>
        </div>
      </div>

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
