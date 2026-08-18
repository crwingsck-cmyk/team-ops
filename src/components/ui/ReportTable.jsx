import { useMemo, useState } from "react";
import { Table2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import EmptyState from "./EmptyState";

function sortValueFor(row, col) {
  const raw = row[col.key];
  if (Array.isArray(raw)) return raw.join("、");
  if (raw == null) return "";
  return raw;
}

function compareValues(a, b) {
  const na = typeof a === "number" ? a : parseFloat(a);
  const nb = typeof b === "number" ? b : parseFloat(b);
  const bothNumeric = String(a).trim() !== "" && String(b).trim() !== "" && !isNaN(na) && !isNaN(nb);
  if (bothNumeric) return na - nb;
  return String(a).localeCompare(String(b), "zh-Hant");
}

function isNumericColumn(rows, col) {
  let sawNumber = false;
  for (const row of rows) {
    const raw = row[col.key];
    if (raw === undefined || raw === null || raw === "") continue;
    if (Array.isArray(raw) || isNaN(Number(raw))) return false;
    sawNumber = true;
  }
  return sawNumber;
}

export default function ReportTable({ columns, rows }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const toggleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;
    const sign = sortDir === "asc" ? 1 : -1;
    return rows.slice().sort((a, b) => sign * compareValues(sortValueFor(a, col), sortValueFor(b, col)));
  }, [rows, columns, sortKey, sortDir]);

  const numericColumns = useMemo(
    () => new Set(columns.filter((c) => isNumericColumn(rows, c)).map((c) => c.key)),
    [columns, rows]
  );
  const hasTotals = numericColumns.size > 0;

  if (rows.length === 0) {
    return <EmptyState icon={Table2} title="沒有符合條件的資料" description="調整篩選條件，或確認資料庫裡已經有資料。" />;
  }

  return (
    <div>
      <p className="text-sm font-bold text-slate-500 mb-2">共 {rows.length} 筆資料</p>
      <div className="rounded-2xl border border-slate-100 custom-scrollbar overflow-auto max-h-[70vh]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {columns.map((col, i) => {
                const isSorted = sortKey === col.key;
                const SortIcon = isSorted ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
                return (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`px-4 py-3 text-sm font-black uppercase tracking-wide whitespace-nowrap bg-slate-50 sticky top-0 cursor-pointer select-none hover:bg-slate-100 transition-colors ${
                      isSorted ? "text-indigo-600" : "text-slate-600"
                    } ${i === 0 ? "left-0 z-20" : "z-10"}`}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <SortIcon size={13} className={isSorted ? "text-indigo-500" : "text-slate-300"} />
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((row, i) => (
              <tr key={row.id || row.key || i} className="group hover:bg-slate-50 transition-colors">
                {columns.map((col, j) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-base text-slate-700 whitespace-nowrap bg-white group-hover:bg-slate-50 ${
                      j === 0 ? "sticky left-0 z-10" : ""
                    }`}
                  >
                    {col.format ? col.format(row) : (row[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {hasTotals && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-black text-slate-800">
                {columns.map((col, i) => (
                  <td key={col.key} className={`px-4 py-3 whitespace-nowrap bg-slate-50 ${i === 0 ? "sticky left-0 z-10" : ""}`}>
                    {i === 0
                      ? "總計"
                      : numericColumns.has(col.key)
                      ? rows.reduce((sum, r) => sum + (Number(r[col.key]) || 0), 0)
                      : ""}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
