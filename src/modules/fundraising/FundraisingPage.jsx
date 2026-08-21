import { useEffect, useMemo, useState } from "react";
import { Settings2, Download, Pencil, Eye } from "lucide-react";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import { useFundraisingPeople, UNASSIGNED_VOLUNTEER_ID } from "../../hooks/useFundraisingPeople";
import { useCustomFilters, buildFieldOptionsMap, matchesActiveFilters } from "../../hooks/useCustomFilters";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import CustomFilterBar from "../../components/ui/CustomFilterBar";
import ReportTable from "../../components/ui/ReportTable";
import FundraisingRecordForm from "./FundraisingRecordForm";
import FundraisingDetail from "./FundraisingDetail";
import FundraisingEventsSection from "./FundraisingEventsSection";
import FundraisingOrganizationsSection from "./FundraisingOrganizationsSection";
import { FUNDRAISING_COLUMNS, DEFAULT_FUNDRAISING_COLUMN_KEYS, flattenDonorRows } from "../../constants/fundraisingColumns";
import { FUNDRAISING_FILTER_FIELDS, DEFAULT_FUNDRAISING_FILTER_KEYS, fundraisingFilterOptionLabel } from "../../constants/fundraisingFilterFields";
import { exportRowsToExcel } from "../../lib/exportExcel";
import { chineseIncludes } from "../../lib/chineseSearch";

const COLUMNS_STORAGE_KEY = "team-ops:fundraising:columns";
const FILTER_KEYS_STORAGE_KEY = "team-ops:fundraising:filterKeys";

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
  const {
    activeKeys: activeFilterKeys,
    setActiveKeys: setActiveFilterKeys,
    values: filterValues,
    setValue: setFilterValue,
    showPicker: showFilterPicker,
    setShowPicker: setShowFilterPicker,
  } = useCustomFilters(FUNDRAISING_FILTER_FIELDS, FILTER_KEYS_STORAGE_KEY, DEFAULT_FUNDRAISING_FILTER_KEYS);
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

  // Flattened once, unfiltered — donor rows (not `people` directly) so a
  // donor's own 和氣/互愛/協力 tag, used by the 未指定志工 placeholder whose
  // donors don't share one group, determines its own visibility/options.
  const allRows = useMemo(() => flattenDonorRows(people), [people]);

  const fieldOptionsMap = useMemo(
    () => buildFieldOptionsMap(FUNDRAISING_FILTER_FIELDS, allRows, fundraisingFilterOptionLabel),
    [allRows]
  );

  const rows = useMemo(() => {
    return allRows.filter((r) => {
      if (!matchesActiveFilters(r, activeFilterKeys, filterValues)) return false;
      if (!search) return true;
      return chineseIncludes(`${r.name} ${r.phone}`, search);
    });
  }, [allRows, activeFilterKeys, filterValues, search]);

  const volunteerOptions = useMemo(
    () => people.filter((p) => p.id !== UNASSIGNED_VOLUNTEER_ID).map((p) => ({ id: p.id.replace(/^v:/, ""), name: p.name, phone: p.phone })),
    [people]
  );

  const handleRecordSubmit = async (data) => {
    const { movedDonors = [], ...recordData } = data;

    if (editingPerson.recordId || recordData.donors.length > 0 || recordData.pledgeTarget !== "" || recordData.enteredBy) {
      if (editingPerson.recordId) {
        await updateRecord(editingPerson.recordId, recordData);
      } else {
        await createRecord({ ...recordData, personKey: editingPerson.id, personName: editingPerson.name, personPhone: editingPerson.phone });
      }
    }

    const movedByVolunteer = new Map();
    for (const { volunteerId, donor } of movedDonors) {
      if (!movedByVolunteer.has(volunteerId)) movedByVolunteer.set(volunteerId, []);
      movedByVolunteer.get(volunteerId).push(donor);
    }
    for (const [volunteerId, newDonors] of movedByVolunteer) {
      const target = people.find((p) => p.id === `v:${volunteerId}`);
      if (!target) continue;
      const donors = [...(target.donors || []), ...newDonors];
      if (target.recordId) {
        await updateRecord(target.recordId, { pledgeTarget: target.pledgeTarget, donors });
      } else {
        await createRecord({ pledgeTarget: target.pledgeTarget, donors, personKey: target.id, personName: target.name, personPhone: target.phone });
      }
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
          <CustomFilterBar
            search={search}
            onSearch={setSearch}
            searchPlaceholder="搜尋姓名或電話..."
            fields={FUNDRAISING_FILTER_FIELDS}
            activeKeys={activeFilterKeys}
            values={filterValues}
            onChange={setFilterValue}
            fieldOptionsMap={fieldOptionsMap}
            onOpenPicker={() => setShowFilterPicker(true)}
          />

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

      <Modal open={showFilterPicker} onClose={() => setShowFilterPicker(false)} title="自訂篩選欄位">
        <FilterFieldPicker
          fields={FUNDRAISING_FILTER_FIELDS}
          selected={activeFilterKeys}
          onSave={(keys) => { setActiveFilterKeys(keys); setShowFilterPicker(false); }}
          onCancel={() => setShowFilterPicker(false)}
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

      <Modal open={!!editingPerson} onClose={() => setEditingPerson(null)} title="記錄募款狀況" size="xl">
        {editingPerson && (
          <FundraisingRecordForm
            person={editingPerson}
            initial={editingPerson.recordId ? editingPerson : null}
            allowVolunteerAssignment={editingPerson.id === UNASSIGNED_VOLUNTEER_ID}
            volunteerOptions={volunteerOptions}
            heQiOptions={heQiOptions}
            huAiOptions={huAiOptions}
            xieLiOptions={xieLiOptions}
            onSubmit={handleRecordSubmit}
            onCancel={() => setEditingPerson(null)}
          />
        )}
      </Modal>
    </div>
  );
}
