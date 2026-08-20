import { useState } from "react";
import Button from "./Button";

export default function FilterFieldPicker({ fields, selected, max = 5, description, onSave, onCancel }) {
  const [picked, setPicked] = useState(selected);

  const toggle = (key) => {
    setPicked((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= max) return prev;
      return [...prev, key];
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-500">{description || `選擇最多 ${max} 個要顯示在篩選列上的欄位。`}</p>
      <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
        {fields.map((f) => {
          const checked = picked.includes(f.key);
          const disabled = !checked && picked.length >= max;
          return (
            <label
              key={f.key}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold transition-all ${
                checked ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"
              } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:border-indigo-300"}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(f.key)}
                className="w-4 h-4 accent-indigo-600"
              />
              {f.label}
            </label>
          );
        })}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="button" onClick={() => onSave(picked)} disabled={picked.length === 0}>儲存</Button>
      </div>
    </div>
  );
}
