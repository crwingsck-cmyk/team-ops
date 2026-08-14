import { useEffect, useMemo } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import { COLLECTION_LABELS } from "../../constants/categoryStyles";
import { daysSince, formatRelativeTime } from "../../lib/time";
import Modal from "../ui/Modal";
import EmptyState from "../ui/EmptyState";

const COLLECTIONS = ["announcements", "events", "registrations", "volunteers", "meetings", "actionItems"];
const PURGE_AFTER_DAYS = 30;

function useDeletedCollection(name) {
  const { data } = useCollection(name, { onlyDeleted: true });
  const crud = useFirestoreCrud(name);
  return { name, data, crud };
}

export default function RecycleBin({ open, onClose }) {
  const sources = [
    useDeletedCollection(COLLECTIONS[0]),
    useDeletedCollection(COLLECTIONS[1]),
    useDeletedCollection(COLLECTIONS[2]),
    useDeletedCollection(COLLECTIONS[3]),
    useDeletedCollection(COLLECTIONS[4]),
    useDeletedCollection(COLLECTIONS[5]),
  ];

  const items = useMemo(() => {
    return sources
      .flatMap((s) => s.data.map((d) => ({ ...d, collectionName: s.name, crud: s.crud })))
      .sort((a, b) => (b.deletedAt?.toMillis?.() || 0) - (a.deletedAt?.toMillis?.() || 0));
  }, [sources]);

  useEffect(() => {
    if (!open) return;
    for (const item of items) {
      if (daysSince(item.deletedAt) > PURGE_AFTER_DAYS) {
        item.crud.permanentlyDelete(item.id);
      }
    }
    // Only run the sweep when the bin is opened / its contents change, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items]);

  return (
    <Modal open={open} onClose={onClose} title="資源回收桶">
      <p className="text-xs text-slate-400 mb-4">刪除的資料會保留在這裡，可以復原；超過 30 天會自動清除。</p>
      {items.length === 0 ? (
        <EmptyState icon={Trash2} title="回收桶是空的" />
      ) : (
        <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
          {items.map((item) => (
            <li key={`${item.collectionName}-${item.id}`} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 hover:scale-[1.02] transition-all duration-200">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 text-sm font-bold shrink-0">
                    {COLLECTION_LABELS[item.collectionName] || item.collectionName}
                  </span>
                  <p className="font-bold text-xl text-slate-800 truncate">{item.title ?? item.name ?? item.description ?? "未命名"}</p>
                </div>
                <p className="text-base text-slate-500 mt-1.5">
                  {item.deletedBy?.name ? `${item.deletedBy.name} 刪除於 ` : "刪除於 "}
                  {formatRelativeTime(item.deletedAt)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => item.crud.restore(item.id)}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600"
                  title="復原"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`確定要永久刪除「${item.title ?? item.name ?? item.description ?? "此項目"}」嗎？此操作無法復原。`)) {
                      item.crud.permanentlyDelete(item.id);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-rose-600"
                  title="永久刪除"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
