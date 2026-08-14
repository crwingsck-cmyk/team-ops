import { Pencil, Trash2 } from "lucide-react";
import Badge from "../../components/ui/Badge";
import { ACTION_ITEM_STATUS } from "../../constants/categoryStyles";

export default function ActionItemRow({ item, onEdit, onDelete }) {
  return (
    <li className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50">
      <div>
        <p className="font-bold text-sm text-slate-800">{item.description}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge tone={ACTION_ITEM_STATUS[item.status]}>{ACTION_ITEM_STATUS[item.status]?.label}</Badge>
          {item.assigneeName && <span className="text-[10px] text-slate-400">負責人：{item.assigneeName}</span>}
          {item.dueDate && <span className="text-[10px] text-slate-400">截止：{item.dueDate}</span>}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600">
          <Pencil size={14} />
        </button>
        <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-rose-600">
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}
