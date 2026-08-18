import { useEffect, useMemo, useState } from "react";
import { Search, CalendarDays, Check, X, ChevronDown, ChevronUp, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import GuestFilterBar from "./GuestFilterBar";
import GuestCard from "./GuestCard";
import { chineseIncludes } from "../../lib/chineseSearch";
import { eventFirstDate, dateRangeText } from "../../lib/eventDays";
import { REGISTRATION_STATUS } from "../../constants/categoryStyles";
import { GUEST_FILTER_FIELDS, DEFAULT_GUEST_FILTER_KEYS, guestFilterOptionLabel } from "../../constants/guestFilterFields";
import { useGuestDirectory } from "../../hooks/useGuestDirectory";

const FILTER_KEYS_STORAGE_KEY = "team-ops:guestFilterKeys";

function loadStoredFilterKeys() {
  const validKeys = new Set(GUEST_FILTER_FIELDS.map((f) => f.key));
  try {
    const stored = JSON.parse(localStorage.getItem(FILTER_KEYS_STORAGE_KEY));
    if (Array.isArray(stored)) {
      const filtered = stored.filter((k) => validKeys.has(k)).slice(0, 3);
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // ignore malformed storage
  }
  return DEFAULT_GUEST_FILTER_KEYS;
}

function registrationDate(r, event) {
  return event ? eventFirstDate(event) : (r.eventDate || "");
}

export default function GuestDirectory({ registrations, events, guests: guestDocs, isAdmin, viewMode, onAdd, onImport, onView, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());
  const [activeFilterKeys, setActiveFilterKeys] = useState(loadStoredFilterKeys);
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(GUEST_FILTER_FIELDS.map((f) => [f.key, "all"]))
  );
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [queryTitle, setQueryTitle] = useState("");
  const [queryEventIds, setQueryEventIds] = useState([]);

  const toggleQueryEventId = (id) => {
    setQueryEventIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  useEffect(() => {
    localStorage.setItem(FILTER_KEYS_STORAGE_KEY, JSON.stringify(activeFilterKeys));
  }, [activeFilterKeys]);

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const guests = useGuestDirectory({ registrations, events, guestDocs });

  const eventsByTitle = useMemo(() => {
    const map = new Map();
    events.forEach((e) => {
      if (!e.title) return;
      if (!map.has(e.title)) map.set(e.title, []);
      map.get(e.title).push(e);
    });
    map.forEach((list) => list.sort((a, b) => (b.date || "").localeCompare(a.date || "")));
    return map;
  }, [events]);

  const queryEventOptions = useMemo(
    () => (queryTitle ? (eventsByTitle.get(queryTitle) || []) : []),
    [queryTitle, eventsByTitle]
  );

  const fieldOptionsMap = useMemo(() => {
    const map = {};
    GUEST_FILTER_FIELDS.forEach((field) => {
      if (field.source === "enum") {
        map[field.key] = Object.keys(field.enumOptions).map((k) => ({
          value: k,
          label: guestFilterOptionLabel(field, k),
        }));
        return;
      }
      const set = new Set();
      guests.forEach((g) => {
        const raw = g[field.key];
        const values = field.source === "dynamicArray" ? (Array.isArray(raw) ? raw : []) : (raw ? [String(raw)] : []);
        values.forEach((v) => v && set.add(v));
      });
      map[field.key] = [...set].sort().map((v) => ({ value: v, label: v }));
    });
    return map;
  }, [guests]);

  const setFilterValue = (key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }));

  const filtered = useMemo(() => {
    return guests.filter((g) => {
      for (const key of activeFilterKeys) {
        const wanted = filterValues[key];
        if (!wanted || wanted === "all") continue;
        const fieldVal = g[key];
        const matches = Array.isArray(fieldVal) ? fieldVal.includes(wanted) : String(fieldVal ?? "") === wanted;
        if (!matches) return false;
      }
      if (queryTitle) {
        const wantedEventIds = queryEventIds.length > 0 ? queryEventIds : queryEventOptions.map((e) => e.id);
        if (!g.attendedEventIds.some((id) => wantedEventIds.includes(id))) return false;
      }
      if (!search) return true;
      return chineseIncludes(`${g.name} ${g.phone} ${g.area}`, search);
    });
  }, [guests, search, activeFilterKeys, filterValues, queryTitle, queryEventIds, queryEventOptions]);

  const toggleExpanded = (key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div>
      <GuestFilterBar
        search={search}
        onSearch={setSearch}
        activeFilterKeys={activeFilterKeys}
        filterValues={filterValues}
        onFilterChange={setFilterValue}
        fieldOptionsMap={fieldOptionsMap}
        onOpenFieldPicker={() => setShowFieldPicker(true)}
        onAdd={onAdd}
        onImport={onImport}
      />

      <div className="flex flex-col gap-3 mb-6 p-4 rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex flex-col sm:flex-row gap-3">
          <span className="text-sm font-bold text-slate-500 sm:self-center shrink-0">查詢是否出席：</span>
          <Select
            value={queryTitle}
            onChange={(e) => { setQueryTitle(e.target.value); setQueryEventIds([]); }}
            className="sm:w-52 !py-2 !text-base"
          >
            <option value="">選擇活動名稱</option>
            {[...eventsByTitle.keys()].sort().map((title) => (
              <option key={title} value={title}>{title}</option>
            ))}
          </Select>
        </div>
        {queryTitle && (
          <div>
            <p className="text-xs text-slate-400 mb-2">勾選日期（可複選；都不勾表示查全部日期）</p>
            <div className="flex flex-wrap gap-2">
              {queryEventOptions.map((e) => {
                const checked = queryEventIds.includes(e.id);
                return (
                  <label
                    key={e.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold cursor-pointer transition-all ${
                      checked ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-indigo-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleQueryEventId(e.id)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    {dateRangeText(e)}{e.deletedAt && "（已刪除）"}
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={guests.length === 0 ? "還沒有大德資料" : "找不到符合的紀錄"}
          description="點選「新增大德資料」手動建立，或透過活動報名時的「新增大德報名」登記，都會出現在這裡。"
          action={<Button icon={Plus} onClick={onAdd}>新增大德資料</Button>}
        />
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((g) => (
            <GuestCard key={g.key} guest={g} isAdmin={isAdmin} onView={onView} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => {
            const isExpanded = expandedKeys.has(g.key);
            return (
              <Card key={g.key} className="!p-0 overflow-hidden">
                <div className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <button
                    onClick={() => toggleExpanded(g.key)}
                    className="flex-1 min-w-0 flex items-center gap-3 text-left"
                    title="查看參與過的活動"
                  >
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                    <div className="flex-1 min-w-0 flex items-baseline gap-4 flex-wrap">
                      <span className="font-black italic text-slate-800 text-lg">{g.name}</span>
                      <span className="text-sm text-slate-500">{g.phone || "-"}</span>
                    </div>
                  </button>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => onView(g)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => onEdit(g)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600">
                      <Pencil size={18} />
                    </button>
                    {isAdmin && (
                      <button onClick={() => onDelete(g)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <ul className="space-y-2 px-5 pb-5">
                    {g.notes && (
                      <li className="p-3 rounded-xl bg-slate-50 text-sm text-slate-600 italic">備註：{g.notes}</li>
                    )}
                    {g.records.length === 0 && (
                      <li className="p-3 rounded-xl bg-slate-50 text-sm text-slate-400 italic">尚未參加任何活動</li>
                    )}
                    {g.records
                      .slice()
                      .sort((a, b) =>
                        registrationDate(b, eventsById.get(b.eventId)).localeCompare(registrationDate(a, eventsById.get(a.eventId)))
                      )
                      .map((r) => {
                        const event = eventsById.get(r.eventId);
                        const statusInfo = REGISTRATION_STATUS[r.status];
                        const title = event?.title || r.eventTitle || "（活動已刪除）";
                        const date = registrationDate(r, event);
                        return (
                          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50">
                            <div className="flex items-center gap-2 min-w-0">
                              <CalendarDays size={16} className="text-slate-400 shrink-0" />
                              <span className="font-bold text-slate-700 truncate">{title}</span>
                              {date && <span className="text-xs text-slate-400 shrink-0">{date}</span>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {statusInfo && (
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</span>
                              )}
                              {r.attended ? (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white">
                                  <Check size={12} /> 已出席
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-400">
                                  <X size={12} /> 未出席
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showFieldPicker} onClose={() => setShowFieldPicker(false)} title="自訂篩選欄位">
        <FilterFieldPicker
          fields={GUEST_FILTER_FIELDS}
          selected={activeFilterKeys}
          onSave={(keys) => {
            setActiveFilterKeys(keys);
            setShowFieldPicker(false);
          }}
          onCancel={() => setShowFieldPicker(false)}
        />
      </Modal>
    </div>
  );
}
