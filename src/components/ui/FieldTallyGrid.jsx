import Card from "./Card";

function enumLabelFor(field, key) {
  const raw = field.enumOptions[key];
  if (raw == null) return key;
  return typeof raw === "string" ? raw.split(" ")[0] : (raw.label || key);
}

function tallyField(rows, field, getValue) {
  const counts = new Map();
  rows.forEach((row) => {
    const raw = getValue ? getValue(row, field) : row[field.key];
    const values = field.source === "dynamicArray" ? (Array.isArray(raw) ? raw : []) : (raw ? [String(raw)] : []);
    values.forEach((v) => {
      if (!v) return;
      counts.set(v, (counts.get(v) || 0) + 1);
    });
  });
  return counts;
}

export default function FieldTallyGrid({ fields, rows, getValue }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {fields.map((field) => {
        const counts = tallyField(rows, field, getValue);
        const entries = field.source === "enum"
          ? Object.keys(field.enumOptions).map((k) => [enumLabelFor(field, k), counts.get(k) || 0])
          : [...counts.entries()].sort((a, b) => b[1] - a[1]);
        const total = entries.reduce((sum, [, c]) => sum + c, 0);
        return (
          <Card key={field.key}>
            <h3 className="font-black italic text-slate-800 text-lg mb-3">{field.label}</h3>
            <div className="space-y-1">
              {entries.length === 0 ? (
                <p className="text-sm text-slate-400 italic">尚無資料</p>
              ) : (
                entries.map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between text-sm text-slate-600 py-0.5">
                    <span>{label}</span>
                    <span className="font-bold text-slate-800">{count}</span>
                  </div>
                ))
              )}
            </div>
            {total > 0 && (
              <div className="flex items-center justify-between text-sm font-black text-indigo-600 pt-2 mt-2 border-t border-slate-100">
                <span>總計</span>
                <span>{total}</span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
