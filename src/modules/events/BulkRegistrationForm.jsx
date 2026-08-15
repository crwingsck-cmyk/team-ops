import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { chineseIncludes } from "../../lib/chineseSearch";
import { heqiHuaiXieliText } from "../../lib/volunteer";
import { TC_IDENTIFICATION_LABELS, REGISTRATION_STATUS, registrationStatusSelectClass } from "../../constants/categoryStyles";

function tcIdentificationLabel(key) {
  return TC_IDENTIFICATION_LABELS[key]?.split(" ")[0] || "";
}

export default function BulkRegistrationForm({ volunteers, alreadyRegisteredIds, onSubmit, onCancel }) {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [status, setStatus] = useState("registered");
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const available = useMemo(
    () => volunteers.filter((v) => !alreadyRegisteredIds.has(v.id)),
    [volunteers, alreadyRegisteredIds]
  );

  const groupOptions = useMemo(() => {
    const set = new Set();
    available.forEach((v) => { const t = heqiHuaiXieliText(v); if (t) set.add(t); });
    return [...set].sort();
  }, [available]);

  const filtered = useMemo(() => {
    return available.filter((v) => {
      if (group !== "all" && heqiHuaiXieliText(v) !== group) return false;
      if (!search) return true;
      return chineseIncludes(`${v.name} ${v.phone || ""}`, search);
    });
  }, [available, search, group]);

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((v) => selectedIds.has(v.id));

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((v) => next.delete(v.id));
      } else {
        filtered.forEach((v) => next.add(v.id));
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selected = volunteers.filter((v) => selectedIds.has(v.id));
    onSubmit(selected, status);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋志工姓名、電話..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-lg hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          />
        </div>
        <Select value={group} onChange={(e) => setGroup(e.target.value)} className="sm:w-56">
          <option value="all">全部和氣互愛協力</option>
          {groupOptions.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </Select>
      </div>

      <Select
        label="這批要標記為"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className={registrationStatusSelectClass(status)}
      >
        {Object.entries(REGISTRATION_STATUS).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </Select>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">已選 {selectedIds.size} 位</p>
        {filtered.length > 0 && (
          <button
            type="button"
            onClick={toggleSelectAllFiltered}
            className="text-sm font-bold text-indigo-600 hover:underline"
          >
            {allFilteredSelected ? "取消全選目前結果" : `全選目前結果（${filtered.length} 位）`}
          </button>
        )}
      </div>

      <div className="max-h-[45vh] overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-slate-400 italic">
            {available.length === 0 ? "所有志工都已經在報名名單裡了" : "找不到符合的志工"}
          </p>
        ) : (
          filtered.map((v) => (
            <label key={v.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedIds.has(v.id)}
                onChange={() => toggle(v.id)}
                className="w-5 h-5 shrink-0 accent-indigo-600"
              />
              <div className="flex-1 grid grid-cols-4 gap-3 items-center min-w-0">
                <span className="font-bold text-slate-800 truncate">{v.name}</span>
                <span className="text-sm text-slate-500 truncate">{v.phone || "-"}</span>
                <span className="text-sm text-slate-500 truncate">{heqiHuaiXieliText(v) || "-"}</span>
                <span className="text-sm text-slate-500 truncate">{tcIdentificationLabel(v.tcIdentification) || "-"}</span>
              </div>
            </label>
          ))
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={selectedIds.size === 0}>加入 {selectedIds.size} 位</Button>
      </div>
    </form>
  );
}
