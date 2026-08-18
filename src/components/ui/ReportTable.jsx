import { Table2 } from "lucide-react";
import EmptyState from "./EmptyState";

export default function ReportTable({ columns, rows }) {
  if (rows.length === 0) {
    return <EmptyState icon={Table2} title="沒有符合條件的資料" description="調整篩選條件，或確認資料庫裡已經有資料。" />;
  }

  return (
    <div className="rounded-2xl border border-slate-100 custom-scrollbar overflow-auto max-h-[70vh]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-sm font-black text-slate-600 uppercase tracking-wide whitespace-nowrap bg-slate-50 sticky top-0 ${
                  i === 0 ? "left-0 z-20" : "z-10"
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={row.id || row.key || i} className="group hover:bg-slate-50 transition-colors">
              {columns.map((col, j) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-base text-slate-700 whitespace-nowrap ${
                    j === 0 ? "sticky left-0 z-10 bg-white group-hover:bg-slate-50" : "bg-white group-hover:bg-slate-50"
                  }`}
                >
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
