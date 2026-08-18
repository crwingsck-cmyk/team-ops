import Card from "./Card";
import EmptyState from "./EmptyState";
import { Table2 } from "lucide-react";

function fieldValue(row, col) {
  return col.format ? col.format(row) : (row[col.key] ?? "-");
}

export default function RecordCardGrid({ columns, rows }) {
  if (rows.length === 0) {
    return <EmptyState icon={Table2} title="沒有符合條件的資料" description="調整篩選條件，或確認資料庫裡已經有資料。" />;
  }

  const [titleCol, ...restCols] = columns;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rows.map((row, i) => (
        <Card key={row.key ?? row.id ?? i}>
          {titleCol && <h3 className="font-black italic text-slate-800 text-xl mb-3">{fieldValue(row, titleCol)}</h3>}
          <div className="space-y-1.5">
            {restCols.map((col) => (
              <div key={col.key} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-slate-400 font-bold shrink-0">{col.label}</span>
                <span className="text-slate-700 text-right">{fieldValue(row, col)}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
