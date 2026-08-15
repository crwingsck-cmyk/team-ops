import { Pencil, Trash2 } from "lucide-react";
import Badge from "../../components/ui/Badge";
import { ACTION_ITEM_STATUS } from "../../constants/categoryStyles";

export default function ActionItemRow({ item, isAdmin, onEdit, onDelete }) {
  return (
    <li className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-50 hover:scale-[1.02] transition-all duration-200">
      <div>
        <p className="font-bold text-xl text-slate-800">{item.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <Badge tone={ACTION_ITEM_STATUS[item.status]}>{ACTION_ITEM_STATUS[item.status]?.label}</Badge>
          {item.assigneeName && <span className="text-base text-slate-500">負責人：{item.assigneeName}</span>}
          {item.helperNames && <span className="text-base text-slate-500">協助：{item.helperNames}</span>}
          {item.dueDate && <span className="text-base text-slate-500">期限：{item.dueDate}</span>}
        </div>
        {item.expectedOutcome && <p className="text-base text-slate-500 italic mt-1">預期成果：{item.expectedOutcome}</p>}
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600">
          <Pencil size={18} />
        </button>
        {isAdmin && (
          <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-rose-600">
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </li>
  );
}
