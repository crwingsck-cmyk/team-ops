import { Search, Settings2 } from "lucide-react";
import Select from "./Select";

export default function CustomFilterBar({
  search,
  onSearch,
  searchPlaceholder = "搜尋...",
  fields,
  activeKeys,
  values,
  onChange,
  fieldOptionsMap,
  onOpenPicker,
}) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
      {onSearch && (
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-lg hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          />
        </div>
      )}
      {activeKeys.map((key) => {
        const field = fields.find((f) => f.key === key);
        if (!field) return null;
        return (
          <Select key={key} value={values[key] || "all"} onChange={(e) => onChange(key, e.target.value)} className="sm:w-44">
            <option value="all">全部{field.label}</option>
            {(fieldOptionsMap[key] || []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        );
      })}
      <button
        onClick={onOpenPicker}
        className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all"
        title="自訂篩選欄位"
      >
        <Settings2 size={18} />
      </button>
    </div>
  );
}
