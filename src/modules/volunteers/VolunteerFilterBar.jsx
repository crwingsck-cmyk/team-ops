import { Search } from "lucide-react";
import Select from "../../components/ui/Select";

export default function VolunteerFilterBar({ search, onSearch, status, onStatus }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="搜尋姓名、電話、專長..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-lg hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        />
      </div>
      <Select value={status} onChange={(e) => onStatus(e.target.value)} className="sm:w-40">
        <option value="all">全部狀態</option>
        <option value="active">在職</option>
        <option value="inactive">非在職</option>
      </Select>
    </div>
  );
}
