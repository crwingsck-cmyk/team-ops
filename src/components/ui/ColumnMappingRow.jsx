import { useState } from "react";
import Select from "./Select";

export default function ColumnMappingRow({ label, required, headers, value, onChange }) {
  const [displayLabel, setDisplayLabel] = useState(label);

  return (
    <div className="grid grid-cols-2 gap-2 items-center">
      <input
        type="text"
        value={displayLabel}
        onChange={(e) => setDisplayLabel(e.target.value)}
        className="text-sm font-bold text-slate-600 bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none transition-all"
      />
      <div className="flex items-center gap-1">
        <Select value={value || ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">不匯入</option>
          {headers.map((h) => <option key={h} value={h}>{h}</option>)}
        </Select>
        {required && <span className="text-rose-500 shrink-0">*</span>}
      </div>
    </div>
  );
}
