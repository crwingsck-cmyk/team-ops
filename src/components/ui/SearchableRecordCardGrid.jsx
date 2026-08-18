import { useState } from "react";
import { Search } from "lucide-react";
import RecordCardGrid from "./RecordCardGrid";
import EmptyState from "./EmptyState";
import { chineseIncludes } from "../../lib/chineseSearch";

export default function SearchableRecordCardGrid({ columns, rows, searchKey = "name", placeholder = "搜尋姓名..." }) {
  const [search, setSearch] = useState("");
  const matches = search ? rows.filter((r) => chineseIncludes(String(r[searchKey] ?? ""), search)) : [];

  return (
    <div>
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-lg hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        />
      </div>
      {!search ? (
        <EmptyState icon={Search} title="輸入姓名搜尋" description="搜尋姓名以顯示個人卡片。" />
      ) : (
        <RecordCardGrid columns={columns} rows={matches} />
      )}
    </div>
  );
}
