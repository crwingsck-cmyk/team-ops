import { useEffect, useMemo, useState } from "react";
import { Settings2, Download, Search, Pencil, Eye } from "lucide-react";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import { useFundraisingPeople } from "../../hooks/useFundraisingPeople";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import ReportTable from "../../components/ui/ReportTable";
import FundraisingRecordForm from "./FundraisingRecordForm";
import FundraisingDetail from "./FundraisingDetail";
import FundraisingEventsSection from "./FundraisingEventsSection";
import FundraisingOrganizationsSection from "./FundraisingOrganizationsSection";
import { FUNDRAISING_COLUMNS, DEFAULT_FUNDRAISING_COLUMN_KEYS, flattenDonorRows } from "../../constants/fundraisingColumns";
import { exportRowsToExcel } from "../../lib/exportExcel";
import { chineseIncludes } from "../../lib/chineseSearch";

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

export default function FundraisingPage() {
  const { people, heQiOptions, huAiOptions, xieLiOptions, loading } = useFundraisingPeople();
  const { create: createRecord, update: updateRecord } = useFirestoreCrud("fundraisingRecords");

  const [activeColumnKeys, setActiveColumnKeys] = useState(loadStoredKeys);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [heQi, setHeQi] = useState("all");
  const [huAi, setHuAi] = useState("all");
  const [xieLi, setXieLi] = useState("all");
  const [search, setSearch] = useState("");
  const [editingPerson, setEditingPerson] = useState(null);
  const [viewingPerson, setViewingPerson] = useState(null);
  const [viewMode, setViewMode] = useState("person");

  useEffect(() => {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(activeColumnKeys));
  }, [activeColumnKeys]);

  const columns = useMemo(() => {
    const base = FUNDRAISING_COLUMNS.filter((c) => activeColumnKeys.includes(c.key));
    return [
      ...base,
      {
        key: "actions",
        label: "操作",
        format: (row) => (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewingPerson(row)}
              className="flex items-center gap-1 text-slate-500 font-bold hover:text-indigo-600"
            >
              <Eye size={14} /> 查閱
            </button>
            <button
              onClick={() => setEditingPerson(row)}
              className="flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800"
            >
              <Pencil size={14} /> 記錄
            </button>
          </div>
        ),
      },
    ];
  }, [activeColumnKeys]);

  const rows = useMemo(() => {
    const filtered = people.filter((p) => {
      if (heQi !== "all" && p.heQi !== heQi) return false;
      if (huAi !== "all" && p.huAi !== huAi) return false;
      if (xieLi !== "all" && p.xieLi !== xieLi) return false;
      if (!search) return true;
      return chineseIncludes(`${p.name} ${p.phone}`, search);
    });
    return flattenDonorRows(filtered);
  }, [people, heQi, huAi, xieLi, search]);

  const handleRecordSubmit = async (data) => {
    if (editingPerson.recordId) {
      await updateRecord(editingPerson.recordId, data);
    } else {
      await createRecord({ ...data, personKey: editingPerson.id, personName: editingPerson.name, personPhone: editingPerson.phone });
    }
    setEditingPerson(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-black italic text-slate-800">募款募心</h2>
          <p className="text-sm text-slate-500 mt-1">志工資料庫彙整，可依和氣、互愛、協力分別篩選，並記錄每位志工向大德募款的狀況。</p>
        </div>
        {viewMode === "person" && (
          <div className="flex gap-2">
            <Button variant="secondary" icon={Settings2} onClick={() => setShowColumnPicker(true)}>選擇欄位</Button>
            <Button icon={Download} onClick={() => exportRowsToExcel("募款募心名單.xlsx", FUNDRAISING_COLUMNS.filter((c) => activeColumnKeys.includes(c.key)), rows)}>匯出 Excel</Button>
          </div>
        )}
      </div>

      <div className="flex rounded-xl border border-slate-200 overflow-hidden w-fit mb-6">
        <button
          onClick={() => setViewMode("person")}
          className={`px-5 py-2.5 font-bold transition-colors ${viewMode === "person" ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:text-slate-700"}`}
        >
          志工募款
        </button>
        <button
          onClick={() => setViewMode("organization")}
          className={`px-5 py-2.5 font-bold transition-colors ${viewMode === "organization" ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:text-slate-700"}`}
        >
          公司/團體
        </button>
        <button
          onClick={() => setViewMode("event")}
          className={`px-5 py-2.5 font-bold transition-colors ${viewMode === "event" ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:text-slate-700"}`}
        >
          活動
        </button>
      </div>

      {viewMode === "event" ? (
        <FundraisingEventsSection />
      ) : viewMode === "organization" ? (
        <FundraisingOrganizationsSection />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜尋姓名或電話..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-lg hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
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

      <Modal
        open={!!viewingPerson}
        onClose={() => setViewingPerson(null)}
        title="募款詳情"
        footer={
          <Button
            icon={Pencil}
            onClick={() => {
              setEditingPerson(viewingPerson);
              setViewingPerson(null);
            }}
          >
            編輯
          </Button>
        }
      >
        {viewingPerson && <FundraisingDetail person={viewingPerson} />}
      </Modal>

      <Modal open={!!editingPerson} onClose={() => setEditingPerson(null)} title="記錄募款狀況">
        {editingPerson && (
          <FundraisingRecordForm
            person={editingPerson}
            initial={editingPerson.recordId ? editingPerson : null}
            onSubmit={handleRecordSubmit}
            onCancel={() => setEditingPerson(null)}
          />
        )}
      </Modal>
    </div>
  );
}
