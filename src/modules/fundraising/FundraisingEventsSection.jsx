import { useState } from "react";
import { Plus, Download, Pencil, Trash2 } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import { useMembership } from "../../hooks/useMembership";
import { useVolunteerOrgOptions } from "../../hooks/useVolunteerOrgOptions";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ReportTable from "../../components/ui/ReportTable";
import FundraisingEventForm from "./FundraisingEventForm";
import { exportRowsToExcel } from "../../lib/exportExcel";

const COLUMNS = [
  { key: "date", label: "日期" },
  { key: "time", label: "時間" },
  { key: "location", label: "地點" },
  { key: "eventType", label: "活動形式" },
  { key: "heQi", label: "和氣" },
  { key: "huAi", label: "互愛" },
  { key: "xieLi", label: "協力" },
  { key: "amount", label: "募款金額", format: (r) => (r.amount || 0).toLocaleString() },
  { key: "volunteerCount", label: "出席志工人數" },
  { key: "guestCount", label: "出席大德人數" },
  { key: "submittedBy", label: "填表者" },
  { key: "attachmentUrl", label: "照片", format: (r) => (r.attachmentUrl ? "有照片" : "-") },
  { key: "story", label: "溫馨故事", format: (r) => r.story || "-" },
];

export default function FundraisingEventsSection() {
  const { data: events, loading } = useCollection("fundraisingEvents", { orderByField: "date", orderByDirection: "desc" });
  const { create, update, remove } = useFirestoreCrud("fundraisingEvents");
  const { isAdmin } = useMembership();
  const { heQiOptions, huAiOptions, xieLiOptions, volunteerOptions } = useVolunteerOrgOptions();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

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
    ...COLUMNS.map((c) => c.key === "attachmentUrl"
      ? {
          ...c,
          format: (r) => r.attachmentUrl ? (
            <a href={r.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">
              查看
            </a>
          ) : "-",
        }
      : c
    ),
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
        <Button variant="secondary" icon={Download} onClick={() => exportRowsToExcel("活動募款紀錄.xlsx", COLUMNS, events)}>匯出 Excel</Button>
        <Button icon={Plus} onClick={openCreate}>新增活動募款</Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : (
        <ReportTable columns={columns} rows={events} />
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing?.id ? "編輯活動募款" : "新增活動募款"}>
        <FundraisingEventForm
          initial={editing}
          heQiOptions={heQiOptions}
          huAiOptions={huAiOptions}
          xieLiOptions={xieLiOptions}
          volunteerOptions={volunteerOptions}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting.id)}
        message={deleting ? `確定要刪除 ${deleting.date} 的活動募款記錄嗎？` : ""}
      />
    </div>
  );
}
