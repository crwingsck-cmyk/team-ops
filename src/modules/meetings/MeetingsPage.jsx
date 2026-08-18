import { useRef, useState } from "react";
import { Plus, ClipboardList, ChevronRight, Eye, Pencil, Trash2, Video, Calendar, LayoutGrid, List, Upload, Loader2 } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import { useMembership } from "../../hooks/useMembership";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import MeetingForm from "./MeetingForm";
import MeetingDetail from "./MeetingDetail";
import { parseMeetingFile } from "../../lib/parseMeetingFile";

export default function MeetingsPage() {
  const { data: meetings, loading } = useCollection("meetings", { orderByField: "date", orderByDirection: "desc" });
  const { data: volunteers } = useCollection("volunteers");
  const { create, update, remove } = useFirestoreCrud("meetings");
  const { isAdmin } = useMembership();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef(null);

  const selected = meetings.find((m) => m.id === selectedId);

  if (selected) {
    return <MeetingDetail meeting={selected} isAdmin={isAdmin} onBack={() => setSelectedId(null)} />;
  }

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportError("");
    setImporting(true);
    try {
      const { title, html } = await parseMeetingFile(file);
      setEditing({ title, otherNotes: html });
      setShowForm(true);
    } catch {
      setImportError("無法讀取這個檔案，請確認是 .docx 或 .pdf 格式。");
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (data) => {
    if (editing?.id) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-black italic text-slate-800">會議記錄</h2>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode("card")}
              className={`p-3 transition-colors ${viewMode === "card" ? "bg-indigo-600 text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}
              title="卡片式"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 transition-colors ${viewMode === "list" ? "bg-indigo-600 text-white" : "bg-white text-slate-400 hover:text-slate-600"}`}
              title="排列式"
            >
              <List size={18} />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.pdf"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button
            variant="secondary"
            icon={importing ? Loader2 : Upload}
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            {importing ? "解析中…" : "匯入 Word/PDF"}
          </Button>
          <Button icon={Plus} onClick={openCreate}>新增會議</Button>
        </div>
      </div>

      {importError && <p className="text-rose-600 font-bold text-sm mb-4">{importError}</p>}

      {loading ? (
        <div className="text-center py-16 text-slate-400 italic">載入中...</div>
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="還沒有會議記錄"
          description="建立會議記錄、追蹤議程決議與待辦事項。"
          action={<Button icon={Plus} onClick={openCreate}>新增會議</Button>}
        />
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((m) => (
            <Card key={m.id} className="cursor-pointer" onClick={() => setSelectedId(m.id)}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-black italic text-slate-800 text-2xl">{m.title}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedId(m.id); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(m); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                  >
                    <Pencil size={18} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleting(m); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-lg text-slate-500 mb-3">{m.date}</p>
              <div className="flex items-center justify-between text-lg text-slate-500">
                <span className="flex items-center gap-3">
                  {m.attendeeNamesSnapshot?.length || 0} 位出席
                  {m.meetingLink && <Video size={17} className="text-indigo-500" />}
                </span>
                <ChevronRight size={18} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {meetings.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0 flex items-center gap-4">
                <div className="min-w-0">
                  <h3 className="font-black italic text-slate-800 text-lg truncate">{m.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1 whitespace-nowrap"><Calendar size={14} />{m.date}</span>
                    <span className="whitespace-nowrap">{m.attendeeNamesSnapshot?.length || 0} 位出席</span>
                    {m.meetingLink && <Video size={14} className="text-indigo-500 shrink-0" />}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedId(m.id); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(m); setShowForm(true); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                >
                  <Pencil size={18} />
                </button>
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleting(m); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <ChevronRight size={18} className="text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing?.id ? "編輯會議" : "新增會議"}>
        <MeetingForm initial={editing} volunteers={volunteers} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(deleting.id)}
        message={deleting ? `確定要刪除會議「${deleting.title}」嗎？` : ""}
      />
    </div>
  );
}
