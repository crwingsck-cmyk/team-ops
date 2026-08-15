import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function MultiSelectFilter({ label, options, selected, onChange, className = "" }) {
  const [open, setOpen] = useState(false);

  const toggle = (value) => {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-slate-200 text-base text-slate-800 hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-white"
      >
        <span className="truncate">{selected.length === 0 ? `全部${label}` : `${label}（已選 ${selected.length}）`}</span>
        <ChevronDown size={16} className="text-slate-400 shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-72 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1.5">
            {options.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-400 italic">沒有可選的資料</p>
            ) : (
              options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                    className="w-4 h-4 accent-indigo-600 shrink-0"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
