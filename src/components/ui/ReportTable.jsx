import { useMemo, useState } from "react";
import { Table2, ArrowUp, ArrowDown, ArrowUpDown, ListOrdered, Plus, X } from "lucide-react";
import EmptyState from "./EmptyState";
import Modal from "./Modal";
import Button from "./Button";

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
    if (typeof raw !== "number" || isNaN(raw)) return false;
    sawNumber = true;
  }
  return sawNumber;
}

function SortLevelsModal({ open, onClose, columns, sortLevels, setSortLevels }) {
  const usedKeys = new Set(sortLevels.map((l) => l.key));
  const availableColumns = columns.filter((c) => !usedKeys.has(c.key));

  const addLevel = () => {
    if (availableColumns.length === 0) return;
    setSortLevels((prev) => [...prev, { key: availableColumns[0].key, dir: "asc" }]);
  };
  const updateLevel = (i, patch) =>
    setSortLevels((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const removeLevel = (i) => setSortLevels((prev) => prev.filter((_, idx) => idx !== i));
  const moveLevel = (i, dir) =>
    setSortLevels((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <Modal open={open} onClose={onClose} title="多層排序">
      <div className="space-y-3">
        {sortLevels.length === 0 ? (
          <p className="text-sm text-slate-400 italic">還沒有任何排序層級，點下方按鈕新增。</p>
        ) : (
          sortLevels.map((level, i) => {
            const columnOptions = columns.filter((c) => c.key === level.key || !usedKeys.has(c.key));
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 text-center text-sm font-black text-slate-400">{i + 1}</span>
                <select
                  value={level.key}
                  onChange={(e) => updateLevel(i, { key: e.target.value })}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 transition-all duration-200 bg-white"
                >
                  {columnOptions.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => updateLevel(i, { dir: level.dir === "asc" ? "desc" : "asc" })}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:border-indigo-300 transition-all"
                >
                  {level.dir === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  {level.dir === "asc" ? "遞增" : "遞減"}
                </button>
                <button type="button" onClick={() => moveLevel(i, -1)} disabled={i === 0} className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400">
                  <ArrowUp size={16} />
                </button>
                <button type="button" onClick={() => moveLevel(i, 1)} disabled={i === sortLevels.length - 1} className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400">
                  <ArrowDown size={16} />
                </button>
                <button type="button" onClick={() => removeLevel(i)} className="p-2 text-slate-400 hover:text-rose-600">
                  <X size={16} />
                </button>
              </div>
            );
          })
        )}

        <button
          type="button"
          onClick={addLevel}
          disabled={availableColumns.length === 0}
          className="flex items-center gap-1 text-base text-indigo-600 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> 新增排序層級
        </button>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => setSortLevels([])} disabled={sortLevels.length === 0}>
            清除排序
          </Button>
          <Button type="button" onClick={onClose}>完成</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function ReportTable({ columns, rows }) {
  const [sortLevels, setSortLevels] = useState([]);
  const [showSortModal, setShowSortModal] = useState(false);

  const toggleSort = (key) => {
    setSortLevels((prev) => {
      if (prev.length === 1 && prev[0].key === key) {
        return prev[0].dir === "asc" ? [{ key, dir: "desc" }] : [];
      }
      return [{ key, dir: "asc" }];
    });
  };

  const sortedRows = useMemo(() => {
    const levels = sortLevels
      .map((l) => ({ ...l, col: columns.find((c) => c.key === l.key) }))
      .filter((l) => l.col);
    if (levels.length === 0) return rows;
    return rows.slice().sort((a, b) => {
      for (const level of levels) {
        const sign = level.dir === "asc" ? 1 : -1;
        const cmp = compareValues(sortValueFor(a, level.col), sortValueFor(b, level.col));
        if (cmp !== 0) return sign * cmp;
      }
      return 0;
    });
  }, [rows, columns, sortLevels]);

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
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-slate-500">共 {rows.length} 筆資料</p>
        <button
          type="button"
          onClick={() => setShowSortModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <ListOrdered size={15} />
          多層排序{sortLevels.length > 1 ? `（${sortLevels.length} 層）` : ""}
        </button>
      </div>
      <div className="rounded-2xl border border-slate-100 custom-scrollbar overflow-auto max-h-[70vh]">
        <table className="text-left border-collapse">
          <thead>
            <tr>
              {columns.map((col, i) => {
                const levelIndex = sortLevels.findIndex((l) => l.key === col.key);
                const isSorted = levelIndex !== -1;
                const dir = isSorted ? sortLevels[levelIndex].dir : null;
                const SortIcon = isSorted ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
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
                      {sortLevels.length > 1 && isSorted && (
                        <span className="text-[10px] font-black text-indigo-400">{levelIndex + 1}</span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((row, i) => (
              <tr key={row.key ?? row.id ?? i} className="group hover:bg-slate-50 transition-colors">
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

      <SortLevelsModal
        open={showSortModal}
        onClose={() => setShowSortModal(false)}
        columns={columns}
        sortLevels={sortLevels}
        setSortLevels={setSortLevels}
      />
    </div>
  );
}
