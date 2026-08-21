import { useMemo, useState } from "react";
import { Plus, Download, Pencil, Trash2 } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import { useMembership } from "../../hooks/useMembership";
import { useVolunteerOrgOptions } from "../../hooks/useVolunteerOrgOptions";
import { useCustomFilters, buildFieldOptionsMap, matchesActiveFilters } from "../../hooks/useCustomFilters";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ReportTable from "../../components/ui/ReportTable";
import CustomFilterBar from "../../components/ui/CustomFilterBar";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import FundraisingOrganizationForm from "./FundraisingOrganizationForm";
import { exportRowsToExcel } from "../../lib/exportExcel";
import { PLEDGE_STATUS_LABELS, DONATION_TYPE_LABELS, DONATION_FREQUENCY_LABELS } from "../../constants/categoryStyles";
import { FUNDRAISING_ORG_FILTER_FIELDS, DEFAULT_FUNDRAISING_ORG_FILTER_KEYS, fundraisingOrgFilterOptionLabel } from "../../constants/fundraisingOrgFilterFields";
import { chineseIncludes } from "../../lib/chineseSearch";

const FILTER_KEYS_STORAGE_KEY = "team-ops:fundraising:orgFilterKeys";

const COLUMNS = [
  { key: "name", label: "公司/團體名稱" },
  { key: "contactPerson", label: "聯絡人" },
  { key: "phone", label: "電話" },
  { key: "heQi", label: "和氣" },
  { key: "huAi", label: "互愛" },
  { key: "xieLi", label: "協力" },
  { key: "date", label: "日期" },
  { key: "donationType", label: "捐款形式", format: (r) => DONATION_TYPE_LABELS[r.donationType] || "-" },
  { key: "frequency", label: "捐款頻率", format: (r) => DONATION_FREQUENCY_LABELS[r.frequency] || "-" },
  { key: "amount", label: "金額", format: (r) => (r.amount || 0).toLocaleString() },
  { key: "pledgeStatus", label: "認捐狀態", format: (r) => PLEDGE_STATUS_LABELS[r.pledgeStatus]?.label || "-" },
  { key: "progress", label: "追蹤進度" },
  { key: "enteredBy", label: "輸入者" },
  { key: "notes", label: "備註" },
];

export default function FundraisingOrganizationsSection() {
  const { data: organizations, loading } = useCollection("fundraisingOrganizations", { orderByField: "date", orderByDirection: "desc" });
  const { create, update, remove } = useFirestoreCrud("fundraisingOrganizations");
  const { isAdmin } = useMembership();
  const { heQiOptions, huAiOptions, xieLiOptions, volunteerOptions } = useVolunteerOrgOptions();
  const { activeKeys, setActiveKeys, values, setValue, showPicker, setShowPicker } = useCustomFilters(
    FUNDRAISING_ORG_FILTER_FIELDS,
    FILTER_KEYS_STORAGE_KEY,
    DEFAULT_FUNDRAISING_ORG_FILTER_KEYS
  );

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fieldOptionsMap = useMemo(
    () => buildFieldOptionsMap(FUNDRAISING_ORG_FILTER_FIELDS, organizations, fundraisingOrgFilterOptionLabel),
    [organizations]
  );

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((o) => {
      if (!matchesActiveFilters(o, activeKeys, values)) return false;
      if (!search) return true;
      return chineseIncludes(`${o.name} ${o.contactPerson || ""} ${o.phone || ""}`, search);
    });
  }, [organizations, activeKeys, values, search]);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleSubmit = async (data) => {
    if (editing?.id) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setShowForm(false);
  };

  const columns = [
    ...COLUMNS,
    {
      key: "actions",
      label: "操作",
      format: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setEditing(row); setShowForm(true); }}
            className="flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800"
          >
            <Pencil size={14} /> 編輯
          </button>
          {isAdmin && (
            <button
              onClick={() => setDeleting(row)}
              className="flex items-center gap-1 text-rose-600 font-bold hover:text-rose-800"
            >
              <Trash2 size={14} /> 刪除
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
        <Button variant="secondary" icon={Download} onClick={() => exportRowsToExcel("公司團體募款名單.xlsx", COLUMNS, filteredOrganizations)}>匯出 Excel</Button>
        <Button icon={Plus} onClick={openCreate}>新增公司/團體</Button>
      </div>

      <CustomFilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="搜尋公司/團體名稱、聯絡人或電話..."
        fields={FUNDRAISING_ORG_FILTER_FIELDS}
        activeKeys={activeKeys}
        values={values}
        onChange={setValue}
        fieldOptionsMap={fieldOptionsMap}
        onOpenPicker={() => setShowPicker(true)}
      />

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : (
        <ReportTable columns={columns} rows={filteredOrganizations} />
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing?.id ? "編輯公司/團體" : "新增公司/團體"}>
        <FundraisingOrganizationForm
          initial={editing}
          heQiOptions={heQiOptions}
          huAiOptions={huAiOptions}
          xieLiOptions={xieLiOptions}
          volunteerOptions={volunteerOptions}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal open={showPicker} onClose={() => setShowPicker(false)} title="自訂篩選欄位">
        <FilterFieldPicker
          fields={FUNDRAISING_ORG_FILTER_FIELDS}
          selected={activeKeys}
          onSave={(keys) => { setActiveKeys(keys); setShowPicker(false); }}
          onCancel={() => setShowPicker(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting.id)}
        message={deleting ? `確定要刪除「${deleting.name}」的募款記錄嗎？` : ""}
      />
    </div>
  );
}
