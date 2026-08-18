import { Table2 } from "lucide-react";
import EmptyState from "./EmptyState";

export default function ReportTable({ columns, rows }) {
  if (rows.length === 0) {
    return <EmptyState icon={Table2} title="沒有符合條件的資料" description="調整篩選條件，或確認資料庫裡已經有資料。" />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-sm font-black text-slate-600 uppercase tracking-wide whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white/80">
          {rows.map((row, i) => (
            <tr key={row.id || row.key || i} className="hover:bg-slate-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-base text-slate-700 whitespace-nowrap">
                  {col.format ? col.format(row) : (row[col.key] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
