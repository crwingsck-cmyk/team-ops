import { LayoutGrid, List } from "lucide-react";

export default function ListControls({ view, onViewChange, sort, onSortChange }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => onViewChange("grid")}
          className={`p-1.5 rounded-lg transition-all ${view === "grid" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          title="卡片檢視"
        >
          <LayoutGrid size={16} />
        </button>
        <button
          onClick={() => onViewChange("list")}
          className={`p-1.5 rounded-lg transition-all ${view === "list" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          title="列表檢視"
        >
          <List size={16} />
        </button>
      </div>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      >
        <option value="desc">日期：最新到最舊</option>
        <option value="asc">日期：最舊到最新</option>
      </select>
    </div>
  );
}
