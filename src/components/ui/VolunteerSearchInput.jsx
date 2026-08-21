import { useState } from "react";
import { chineseIncludes } from "../../lib/chineseSearch";

function matchesFor(options, query) {
  const q = query.trim();
  if (!q) return [];
  return options.filter((v) => chineseIncludes(`${v.name} ${v.phone}`, q)).slice(0, 8);
}

function resolve(options, value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return options.find((v) => v.name.trim() === trimmed || (v.phone && v.phone.trim() === trimmed)) || null;
}

export default function VolunteerSearchInput({
  options,
  value,
  onChange,
  onSelect,
  placeholder = "輸入姓名或電話搜尋",
  confirmedLabel = "已對應志工",
  unresolvedLabel,
}) {
  const [open, setOpen] = useState(false);
  const matches = open ? matchesFor(options, value) : [];
  const resolved = resolve(options, value);

  const handleChange = (text) => {
    onChange(text);
    setOpen(true);
    onSelect?.(resolve(options, text));
  };
  const handlePick = (match) => {
    onChange(match.name);
    onSelect?.(match);
    setOpen(false);
  };

  return (
    <div>
      <div className="relative">
        <input
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md transition-all duration-200"
        />
        {matches.length > 0 && (
          <div className="absolute z-20 mt-1 w-64 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1.5">
            {matches.map((m) => (
              <button
                type="button"
                key={m.id}
                onMouseDown={() => handlePick(m)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
              >
                <span className="font-bold text-slate-800">{m.name}</span>
                <span className="text-sm text-slate-500">{m.phone}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {value.trim() && (resolved || unresolvedLabel) && (
        <p className={`mt-1 text-sm font-bold ${resolved ? "text-emerald-600" : "text-slate-400"}`}>
          {resolved ? confirmedLabel : unresolvedLabel}
        </p>
      )}
    </div>
  );
}
