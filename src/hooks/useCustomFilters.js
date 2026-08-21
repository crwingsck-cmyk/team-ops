import { useEffect, useState } from "react";

function loadKeys(fields, storageKey, defaultKeys, max) {
  const validKeys = new Set(fields.map((f) => f.key));
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(stored)) {
      const filtered = stored.filter((k) => validKeys.has(k)).slice(0, max);
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // ignore malformed storage
  }
  return defaultKeys;
}

// Drives a "選擇欄位"-style customizable filter bar: which of `fields` are
// active (persisted to localStorage under `storageKey`) and their current
// values. Pair with buildFieldOptionsMap/matchesActiveFilters below.
export function useCustomFilters(fields, storageKey, defaultKeys, max = 5) {
  const [activeKeys, setActiveKeys] = useState(() => loadKeys(fields, storageKey, defaultKeys, max));
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.key, "all"])));
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(activeKeys));
  }, [activeKeys, storageKey]);

  const setValue = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  return { activeKeys, setActiveKeys, values, setValue, showPicker, setShowPicker };
}

// For "enum" fields, options come from the field's own label map. For
// "dynamic" fields, options are whatever values actually appear in `rows`.
export function buildFieldOptionsMap(fields, rows, labelFor) {
  const map = {};
  fields.forEach((field) => {
    if (field.source === "enum") {
      map[field.key] = Object.keys(field.enumOptions).map((k) => ({ value: k, label: labelFor(field, k) }));
      return;
    }
    const set = new Set();
    rows.forEach((r) => { if (r[field.key]) set.add(r[field.key]); });
    map[field.key] = [...set].sort().map((v) => ({ value: v, label: v }));
  });
  return map;
}

export function matchesActiveFilters(row, activeKeys, values) {
  for (const key of activeKeys) {
    const wanted = values[key];
    if (!wanted || wanted === "all") continue;
    if (String(row[key] ?? "") !== wanted) return false;
  }
  return true;
}
