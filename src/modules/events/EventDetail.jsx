import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Users2, Trash2, MapPin, Calendar, Users, Search, Settings2, Check, Upload, Download, Pencil } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import ZoomableText from "../../components/ui/ZoomableText";
import LinkPill from "../../components/ui/LinkPill";
import FilterFieldPicker from "../../components/ui/FilterFieldPicker";
import MultiSelectFilter from "../../components/ui/MultiSelectFilter";
import RegistrationForm from "./RegistrationForm";
import BulkRegistrationForm from "./BulkRegistrationForm";
import RegistrationImportModal from "./RegistrationImportModal";
import { TC_IDENTIFICATION_LABELS, GENDER_LABELS, REGISTRATION_STATUS, registrationStatusSelectClass } from "../../constants/categoryStyles";
import { heqiHuaiXieliText } from "../../lib/volunteer";
import { getDays, eventFirstDate } from "../../lib/eventDays";
import { chineseIncludes } from "../../lib/chineseSearch";
import { exportRowsToExcel } from "../../lib/exportExcel";

function tcIdentificationLabel(key) {
  return TC_IDENTIFICATION_LABELS[key]?.split(" ")[0] || "";
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  );
}

function registrantSearchText(r) {
  return [
    r.name,
    r.phone,
    tcIdentificationLabel(r.tcIdentification),
    r.heqiHuaiXieli,
    r.gender && GENDER_LABELS[r.gender],
    r.raw.inviterName,
    r.raw.area,
    r.raw.notes,
    r.raw.attendingDates?.join(" "),
    REGISTRATION_STATUS[r.raw.status]?.label,
  ].filter(Boolean).join(" ");
}

function resolveRegistrant(r, volunteersById) {
  const v = r.volunteerId ? volunteersById.get(r.volunteerId) : null;
  const source = v || r;
  return {
    name: source.name,
    phone: v ? v.phone : (r.phone || r.contact),
    tcIdentification: source.tcIdentification,
    heQi: source.heQi,
    huAi: source.huAi,
    xieLi: source.xieLi,
    heqiHuaiXieli: heqiHuaiXieliText(source),
    gender: source.gender,
  };
}

const REGISTRATION_FILTER_FIELDS = [
  { key: "tcIdentification", label: "慈濟身份" },
  { key: "inviterName", label: "邀約人姓名", source: "raw" },
  { key: "heQi", label: "和氣" },
  { key: "huAi", label: "互愛" },
  { key: "xieLi", label: "協力" },
  { key: "childrenCount", label: "參與人數（含自己本人）", source: "raw" },
];
const DEFAULT_REG_FILTER_KEYS = ["tcIdentification", "xieLi", "inviterName"];

const REGISTRATION_DISPLAY_FIELDS = [
  { key: "phone", label: "電話" },
  { key: "tcIdentification", label: "慈濟身份" },
  { key: "heqiHuaiXieli", label: "和氣互愛協力" },
  { key: "childrenCount", label: "參與人數（含自己本人）" },
  { key: "gender", label: "性別" },
  { key: "inviterName", label: "邀約人姓名" },
  { key: "area", label: "地區" },
  { key: "attendingDates", label: "參與日期" },
  { key: "notes", label: "備註" },
];
const DEFAULT_REG_DISPLAY_KEYS = ["phone", "tcIdentification", "heqiHuaiXieli", "childrenCount"];
const MAX_REG_DISPLAY_KEYS = 4;

const VOLUNTEER_TC_IDENTIFICATION_KEYS = Object.keys(TC_IDENTIFICATION_LABELS).filter((k) => k !== "da_de");

const REGISTRATION_EXPORT_COLUMNS = [
  { key: "name", label: "姓名" },
  { key: "phone", label: "電話" },
  { key: "category", label: "類別" },
  { key: "tcIdentification", label: "慈濟身份" },
  { key: "heqiHuaiXieli", label: "和氣互愛協力" },
  { key: "gender", label: "性別" },
  { key: "area", label: "地區" },
  { key: "inviterName", label: "邀約人姓名" },
  { key: "childrenCount", label: "參與人數（含自己本人）" },
  { key: "attendingDates", label: "參與日期" },
  { key: "status", label: "報名狀態" },
  { key: "attended", label: "是否出席" },
  { key: "attendedChildrenCount", label: "實際出席人數（含自己本人）" },
  { key: "notes", label: "備註" },
];
const GRID_COLS_CLASS = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5" };

export default function EventDetail({ event, isAdmin, onBack }) {
  const { data: volunteers } = useCollection("volunteers");
  const { data: allRegistrations, loading } = useCollection("registrations");
  const { data: guests } = useCollection("guests");
  const { create, update, remove } = useFirestoreCrud("registrations");

  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingOne, setDeletingOne] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [regSearch, setRegSearch] = useState("");
  const [activeRegFilterKeys, setActiveRegFilterKeys] = useState(DEFAULT_REG_FILTER_KEYS);
  const [regFilterValues, setRegFilterValues] = useState({});
  const [showRegFieldPicker, setShowRegFieldPicker] = useState(false);
  const [activeRegDisplayKeys, setActiveRegDisplayKeys] = useState(DEFAULT_REG_DISPLAY_KEYS);
  const [showRegDisplayPicker, setShowRegDisplayPicker] = useState(false);

  const registrations = useMemo(
    () => allRegistrations.filter((r) => r.eventId === event.id),
    [allRegistrations, event.id]
  );

  const volunteersById = useMemo(() => new Map(volunteers.map((v) => [v.id, v])), [volunteers]);

  const resolvedRegistrations = useMemo(
    () => registrations.map((r) => ({ raw: r, ...resolveRegistrant(r, volunteersById) })),
    [registrations, volunteersById]
  );

  const statusCounts = useMemo(() => {
    const counts = { notAttended: 0 };
    Object.keys(REGISTRATION_STATUS).forEach((k) => { counts[k] = 0; });
    registrations.forEach((r) => {
      if (counts[r.status] !== undefined) counts[r.status] += 1;
      if (r.status !== "waitlisted" && !r.attended) counts.notAttended += 1;
    });
    return counts;
  }, [registrations]);

  const regFieldOptionsMap = useMemo(() => {
    const map = {};
    REGISTRATION_FILTER_FIELDS.forEach((f) => {
      if (f.key === "tcIdentification") {
        map[f.key] = Object.keys(TC_IDENTIFICATION_LABELS).map((k) => ({ value: k, label: tcIdentificationLabel(k) }));
        return;
      }
      const set = new Set();
      resolvedRegistrations.forEach((r) => {
        const val = f.source === "raw" ? r.raw[f.key] : r[f.key];
        const values = f.array ? (val || []) : [val].filter((v) => v !== undefined && v !== null && v !== "");
        values.forEach((v) => set.add(String(v)));
      });
      map[f.key] = [...set].sort().map((v) => ({ value: v, label: v }));
    });
    return map;
  }, [resolvedRegistrations]);

  const setRegFilterValue = (key, value) => setRegFilterValues((prev) => ({ ...prev, [key]: value }));

  const visibleRegistrations = useMemo(() => {
    return resolvedRegistrations.filter((r) => {
      if (statusFilter === "not_attended") {
        if (r.raw.status === "waitlisted" || r.raw.attended) return false;
      } else if (statusFilter !== "all" && r.raw.status !== statusFilter) {
        return false;
      }
      for (const field of REGISTRATION_FILTER_FIELDS) {
        if (!activeRegFilterKeys.includes(field.key)) continue;
        const val = field.source === "raw" ? r.raw[field.key] : r[field.key];
        if (field.array) {
          const wanted = regFilterValues[field.key] || [];
          if (wanted.length === 0) continue;
          const valStrings = (val || []).map(String);
          if (!wanted.some((w) => valStrings.includes(w))) return false;
        } else {
          const wanted = regFilterValues[field.key];
          if (!wanted || wanted === "all") continue;
          if (String(val ?? "") !== wanted) return false;
        }
      }
      if (!regSearch) return true;
      return chineseIncludes(registrantSearchText(r), regSearch);
    });
  }, [resolvedRegistrations, statusFilter, activeRegFilterKeys, regFilterValues, regSearch]);

  const exportRows = useMemo(
    () =>
      visibleRegistrations.map((r) => ({
        name: r.name,
        phone: r.phone || "",
        category: r.raw.volunteerId ? "志工" : "大德",
        tcIdentification: tcIdentificationLabel(r.tcIdentification),
        heqiHuaiXieli: r.heqiHuaiXieli || "",
        gender: GENDER_LABELS[r.gender] || "",
        area: r.raw.area || "",
        inviterName: r.raw.inviterName || "",
        childrenCount: r.raw.childrenCount || 1,
        attendingDates: r.raw.attendingDates?.length > 0 ? r.raw.attendingDates.join("、") : "",
        status: REGISTRATION_STATUS[r.raw.status]?.label || "",
        attended: r.raw.attended ? "已出席" : "未出席",
        attendedChildrenCount: r.raw.attended ? (r.raw.attendedChildrenCount || r.raw.childrenCount || 1) : "",
        notes: r.raw.notes || "",
      })),
    [visibleRegistrations]
  );

  const guestDirectory = useMemo(() => {
    const map = new Map();
    guests.forEach((g) => {
      const key = (g.name || "").trim();
      if (!key) return;
      map.set(key, {
        name: g.name,
        phone: g.phone || "",
        tcIdentification: g.tcIdentification || "",
        heQi: g.heQi || "",
        huAi: g.huAi || "",
        xieLi: g.xieLi || "",
        area: g.area || "",
      });
    });
    allRegistrations.forEach((r) => {
      if (r.volunteerId) return;
      const key = (r.name || "").trim();
      if (!key || map.has(key)) return;
      map.set(key, {
        name: r.name,
        phone: r.phone || r.contact || "",
        tcIdentification: r.tcIdentification || "",
        heQi: r.heQi || "",
        huAi: r.huAi || "",
        xieLi: r.xieLi || "",
        area: r.area || "",
      });
    });
    return [...map.values()];
  }, [allRegistrations, guests]);

  const regSummary = useMemo(() => {
    let volunteerPersonCount = 0;
    let volunteerCompanionCount = 0;
    let daDePersonCount = 0;
    let daDeCompanionCount = 0;
    let attendedVolunteerPersonCount = 0;
    let attendedVolunteerCompanionCount = 0;
    let attendedDaDePersonCount = 0;
    let attendedDaDeCompanionCount = 0;
    let registeredCount = 0;
    registrations.forEach((r) => {
      const headcount = Number(r.childrenCount) || 1;
      const companions = Math.max(0, headcount - 1);
      if (r.status !== "waitlisted") {
        registeredCount += 1;
        if (r.volunteerId) {
          volunteerPersonCount += 1;
          volunteerCompanionCount += companions;
        } else {
          daDePersonCount += 1;
          daDeCompanionCount += companions;
        }
      }
      if (r.attended) {
        const attendedHeadcount = Number(r.attendedChildrenCount ?? r.childrenCount) || 1;
        const attendedCompanions = Math.max(0, attendedHeadcount - 1);
        if (r.volunteerId) {
          attendedVolunteerPersonCount += 1;
          attendedVolunteerCompanionCount += attendedCompanions;
        } else {
          attendedDaDePersonCount += 1;
          attendedDaDeCompanionCount += attendedCompanions;
        }
      }
    });
    const volunteerCount = volunteerPersonCount + volunteerCompanionCount;
    const daDeCount = daDePersonCount + daDeCompanionCount;
    const companionCount = volunteerCompanionCount + daDeCompanionCount;
    const attendedVolunteerCount = attendedVolunteerPersonCount + attendedVolunteerCompanionCount;
    const attendedDaDeCount = attendedDaDePersonCount + attendedDaDeCompanionCount;
    const attendedCompanionCount = attendedVolunteerCompanionCount + attendedDaDeCompanionCount;
    const notAttendedCount = volunteerCount + daDeCount - (attendedVolunteerCount + attendedDaDeCount);
    return {
      volunteerPersonCount,
      volunteerCompanionCount,
      volunteerCount,
      daDePersonCount,
      daDeCompanionCount,
      daDeCount,
      companionCount,
      attendedVolunteerPersonCount,
      attendedVolunteerCompanionCount,
      attendedVolunteerCount,
      attendedDaDePersonCount,
      attendedDaDeCompanionCount,
      attendedDaDeCount,
      attendedCompanionCount,
      notAttendedCount,
      registeredCount,
    };
  }, [registrations]);

  const tcIdentificationAttendance = useMemo(() => {
    const counts = {};
    Object.keys(TC_IDENTIFICATION_LABELS).forEach((k) => { counts[k] = 0; });
    resolvedRegistrations.forEach((r) => {
      if (!r.raw.volunteerId || !r.raw.attended) return;
      if (counts[r.tcIdentification] !== undefined) counts[r.tcIdentification] += 1;
    });
    return counts;
  }, [resolvedRegistrations]);

  const registeredVolunteerIds = useMemo(
    () => new Set(registrations.map((r) => r.volunteerId).filter(Boolean)),
    [registrations]
  );

  const handleImportRow = (data) =>
    create({ ...data, eventId: event.id, eventTitle: event.title, eventDate: eventFirstDate(event) });

  const handleSubmit = async (data) => {
    await create({ ...data, eventId: event.id, eventTitle: event.title, eventDate: eventFirstDate(event) });
    setShowForm(false);
  };

  const handleEditSubmit = async (data) => {
    await update(editingRegistration.id, data);
    setEditingRegistration(null);
  };

  const handleBulkSubmit = async (selectedVolunteers, status) => {
    for (const v of selectedVolunteers) {
      await create({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: eventFirstDate(event),
        volunteerId: v.id,
        name: v.name,
        phone: v.phone || "",
        tcIdentification: v.tcIdentification || "",
        heQi: v.heQi || "",
        huAi: v.huAi || "",
        xieLi: v.xieLi || "",
        childrenCount: v.childrenCount || 1,
        notes: "",
        status,
      });
    }
    setShowBulkForm(false);
  };

  const handleDeleteAll = async () => {
    for (const r of registrations) {
      await remove(r.id);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft size={14} /> 回到活動列表
      </button>

      <Card className="mb-6">
        {event.posterUrl && (
          <img src={event.posterUrl} alt="" className="w-full max-h-72 object-contain bg-slate-100 rounded-2xl mb-4" />
        )}
        <h2 className="text-2xl font-black italic text-slate-800 mb-3">{event.title}</h2>
        {event.description && <ZoomableText text={event.description} colorClass="text-slate-600" className="mb-4" />}

        <div className="space-y-1.5 mb-2">
          {getDays(event).map((d, i) => (
            <div key={i} className="flex flex-wrap items-center gap-4 text-base text-slate-600">
              <span className="flex items-center gap-1.5">
                <Calendar size={17} />
                {d.date}{d.startTime && ` ${d.startTime}${d.endTime ? `-${d.endTime}` : ""}`}
              </span>
              {d.location && <span className="flex items-center gap-1.5"><MapPin size={17} />{d.location}</span>}
            </div>
          ))}
        </div>

        {event.links?.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4">
            {event.links.map((l, i) => (
              <LinkPill key={i} link={l} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-black italic text-slate-700 text-xl flex items-center gap-2">
            <Users size={20} /> 報名名單（{regSummary.registeredCount + regSummary.companionCount}{event.capacity ? ` / ${event.capacity}` : ""}）
          </h3>
          <div className="flex flex-wrap gap-2">
            {isAdmin && registrations.length > 0 && (
              <Button variant="danger" icon={Trash2} onClick={() => setConfirmDeleteAll(true)}>刪除全部報名</Button>
            )}
            <Button variant="secondary" icon={Users2} onClick={() => setShowBulkForm(true)}>志工報名</Button>
            <Button variant="secondary" icon={Upload} onClick={() => setShowImportForm(true)}>Excel 匯入報名名單</Button>
            {registrations.length > 0 && (
              <Button
                variant="secondary"
                icon={Download}
                onClick={() => exportRowsToExcel(`${event.title}-報名名單.xlsx`, REGISTRATION_EXPORT_COLUMNS, exportRows)}
              >
                匯出 Excel
              </Button>
            )}
            <Button icon={Plus} onClick={() => setShowForm(true)}>新增大德報名</Button>
          </div>
        </div>

        {registrations.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-x-12 gap-y-3 mb-4">
              <Stat label="報名總人數（含同行人員）" value={regSummary.volunteerCount + regSummary.daDeCount} />
              <Stat label="出席總人數（含同行人員）" value={regSummary.attendedVolunteerCount + regSummary.attendedDaDeCount} />
              <Stat label="出席同行人員總數" value={regSummary.attendedCompanionCount} />
              <Stat label="無法出席人數" value={regSummary.notAttendedCount} />
            </div>
            <div className="pt-3 border-t border-slate-100">
              <table className="text-sm">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    <th className="text-left pb-1.5 w-28">報名與出席人數</th>
                    <th className="text-right pb-1.5 pr-6">報名人數</th>
                    <th className="text-right pb-1.5">出席人數</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-slate-600">
                    <td className="py-0.5 w-28">志工</td>
                    <td className="py-0.5 pr-6 text-right text-slate-400 tabular-nums">{regSummary.volunteerPersonCount}</td>
                    <td className="py-0.5 text-right font-bold text-slate-800 tabular-nums">{regSummary.attendedVolunteerPersonCount}</td>
                  </tr>
                  <tr className="text-slate-600">
                    <td className="py-0.5 w-28">志工同行人員</td>
                    <td className="py-0.5 pr-6 text-right text-slate-400 tabular-nums">{regSummary.volunteerCompanionCount}</td>
                    <td className="py-0.5 text-right font-bold text-slate-800 tabular-nums">{regSummary.attendedVolunteerCompanionCount}</td>
                  </tr>
                  <tr className="text-slate-600">
                    <td className="py-0.5 w-28">大德</td>
                    <td className="py-0.5 pr-6 text-right text-slate-400 tabular-nums">{regSummary.daDePersonCount}</td>
                    <td className="py-0.5 text-right font-bold text-slate-800 tabular-nums">{regSummary.attendedDaDePersonCount}</td>
                  </tr>
                  <tr className="text-slate-600">
                    <td className="py-0.5 w-28">大德同行人員</td>
                    <td className="py-0.5 pr-6 text-right text-slate-400 tabular-nums">{regSummary.daDeCompanionCount}</td>
                    <td className="py-0.5 text-right font-bold text-slate-800 tabular-nums">{regSummary.attendedDaDeCompanionCount}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="pt-3 pb-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide">
                      慈濟身份出席人數（志工，不含大德）
                    </td>
                  </tr>
                  {VOLUNTEER_TC_IDENTIFICATION_KEYS.map((key) => (
                    <tr key={key} className="text-slate-600">
                      <td className="py-0.5 w-28">{tcIdentificationLabel(key)}</td>
                      <td className="py-0.5 pr-6"></td>
                      <td className="py-0.5 text-right font-bold text-slate-800 tabular-nums">{tcIdentificationAttendance[key] || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {event.links?.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-slate-100">
            {event.links.map((l, i) => (
              <LinkPill key={i} link={l} />
            ))}
          </div>
        )}

        {registrations.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                statusFilter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              全部（{registrations.length}筆）
            </button>
            {Object.entries(REGISTRATION_STATUS).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setStatusFilter(k)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  statusFilter === k ? `${v.bg} ${v.text}` : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                }`}
              >
                {v.label}（{statusCounts[k]}筆）
              </button>
            ))}
            <button
              onClick={() => setStatusFilter("not_attended")}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                statusFilter === "not_attended" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              已報名未出席（{statusCounts.notAttended}筆）
            </button>
          </div>
        )}

        {registrations.length > 0 && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                placeholder="搜尋姓名、電話..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-base hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
            {activeRegFilterKeys.map((key) => {
              const field = REGISTRATION_FILTER_FIELDS.find((f) => f.key === key);
              if (!field) return null;
              if (field.array) {
                return (
                  <MultiSelectFilter
                    key={key}
                    label={field.label}
                    options={regFieldOptionsMap[key] || []}
                    selected={regFilterValues[key] || []}
                    onChange={(values) => setRegFilterValue(key, values)}
                    className="sm:w-48"
                  />
                );
              }
              return (
                <Select
                  key={key}
                  value={regFilterValues[key] || "all"}
                  onChange={(e) => setRegFilterValue(key, e.target.value)}
                  className="sm:w-40"
                >
                  <option value="all">全部{field.label}</option>
                  {(regFieldOptionsMap[key] || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              );
            })}
            <button
              onClick={() => setShowRegFieldPicker(true)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all"
              title="自訂篩選欄位"
            >
              <Settings2 size={18} />
            </button>
            <Button variant="secondary" icon={Settings2} onClick={() => setShowRegDisplayPicker(true)}>選擇顯示欄位</Button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-slate-400 italic">載入中...</div>
        ) : registrations.length === 0 ? (
          <EmptyState icon={Users} title="還沒有人報名" />
        ) : visibleRegistrations.length === 0 ? (
          <EmptyState icon={Users} title="沒有符合條件的報名" />
        ) : (
          <ul className="space-y-2">
            {visibleRegistrations.map((registrant) => {
              const r = registrant.raw;
              const inlineKeys = activeRegDisplayKeys.filter((k) => k !== "area" && k !== "notes");
              const inlineNodes = inlineKeys.map((key) => {
                if (key === "phone") return <span key={key} className="text-base text-slate-500 truncate">{registrant.phone || "-"}</span>;
                if (key === "tcIdentification") return <span key={key} className="text-base text-slate-500 truncate">{tcIdentificationLabel(registrant.tcIdentification) || "-"}</span>;
                if (key === "heqiHuaiXieli") return <span key={key} className="text-base text-slate-500 truncate">{registrant.heqiHuaiXieli || "-"}</span>;
                if (key === "childrenCount") return <span key={key} className="text-base text-slate-500">參與人數：<span className="font-bold text-slate-800">{r.childrenCount || 1}</span></span>;
                if (key === "gender") return <span key={key} className="text-base text-slate-500 truncate">{GENDER_LABELS[registrant.gender] || "-"}</span>;
                if (key === "inviterName") return <span key={key} className="text-base text-slate-500 truncate">邀約人：{r.inviterName || "-"}</span>;
                if (key === "attendingDates") return <span key={key} className="text-base text-slate-500 truncate">參與日期：{r.attendingDates?.length > 0 ? r.attendingDates.join("、") : "-"}</span>;
                return null;
              });
              const gridColsClass = GRID_COLS_CLASS[Math.min(1 + inlineKeys.length, 5)] || "sm:grid-cols-5";
              return (
              <li key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50">
                <div className="flex-1 min-w-0">
                  <div className={`grid grid-cols-1 ${gridColsClass} gap-1.5 sm:gap-3 sm:items-center min-w-0`}>
                    <span className="font-bold text-xl text-slate-800 truncate">{registrant.name}</span>
                    {inlineNodes}
                  </div>
                  {activeRegDisplayKeys.includes("area") && r.area && <p className="text-base text-slate-500 mt-1">地區：{r.area}</p>}
                  {activeRegDisplayKeys.includes("notes") && r.notes && <p className="text-base italic text-slate-500 mt-1">{r.notes}</p>}
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
                  <button
                    onClick={() => update(r.id, { attended: !r.attended })}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                      r.attended
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-400 border-slate-200 hover:border-emerald-400 hover:text-emerald-600"
                    }`}
                    title="標記已出席"
                  >
                    <Check size={16} /> 出席
                  </button>
                  <div className="w-14 shrink-0">
                    {r.attended && (
                      <input
                        type="number"
                        min="1"
                        key={`${r.id}-children-${r.attendedChildrenCount || "default"}`}
                        defaultValue={r.attendedChildrenCount || r.childrenCount || 1}
                        onBlur={(e) => {
                          const val = e.target.value === "" ? 1 : Math.max(1, Number(e.target.value));
                          if (val !== (r.attendedChildrenCount || r.childrenCount || 1)) {
                            update(r.id, { attendedChildrenCount: val });
                          }
                        }}
                        title="實際出席人數（含自己本人）"
                        className="w-14 px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-center"
                      />
                    )}
                  </div>
                  <Select
                    value={r.status}
                    onChange={(e) => update(r.id, { status: e.target.value })}
                    className={`!py-1.5 !text-sm w-32 ${registrationStatusSelectClass(r.status)}`}
                  >
                    {Object.entries(REGISTRATION_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </Select>
                  <button
                    onClick={() => setEditingRegistration(r)}
                    className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600"
                    title="編輯"
                  >
                    <Pencil size={18} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setDeletingOne({ id: r.id, name: registrant.name })}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="新增大德報名">
        <RegistrationForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} guestDirectory={guestDirectory} />
      </Modal>

      <Modal open={!!editingRegistration} onClose={() => setEditingRegistration(null)} title="編輯報名">
        <RegistrationForm
          initial={editingRegistration}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingRegistration(null)}
          guestDirectory={guestDirectory}
        />
      </Modal>

      <Modal open={showImportForm} onClose={() => setShowImportForm(false)} title="Excel 匯入報名名單">
        <RegistrationImportModal onImport={handleImportRow} onClose={() => setShowImportForm(false)} volunteers={volunteers} guestDirectory={guestDirectory} />
      </Modal>

      <Modal open={showBulkForm} onClose={() => setShowBulkForm(false)} title="志工報名">
        <BulkRegistrationForm
          volunteers={volunteers}
          alreadyRegisteredIds={registeredVolunteerIds}
          onSubmit={handleBulkSubmit}
          onCancel={() => setShowBulkForm(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deletingOne}
        onClose={() => setDeletingOne(null)}
        onConfirm={() => remove(deletingOne.id)}
        message={deletingOne ? `確定要刪除「${deletingOne.name}」的報名嗎？` : ""}
      />

      <ConfirmDialog
        open={confirmDeleteAll}
        onClose={() => setConfirmDeleteAll(false)}
        onConfirm={handleDeleteAll}
        title="刪除全部報名"
        message={`確定要刪除這個活動全部 ${registrations.length} 筆報名嗎？此操作無法復原。`}
      />

      <Modal open={showRegFieldPicker} onClose={() => setShowRegFieldPicker(false)} title="自訂篩選欄位">
        <FilterFieldPicker
          fields={REGISTRATION_FILTER_FIELDS}
          selected={activeRegFilterKeys}
          onSave={(keys) => {
            setActiveRegFilterKeys(keys);
            setShowRegFieldPicker(false);
          }}
          onCancel={() => setShowRegFieldPicker(false)}
        />
      </Modal>

      <Modal open={showRegDisplayPicker} onClose={() => setShowRegDisplayPicker(false)} title="選擇顯示欄位">
        <FilterFieldPicker
          fields={REGISTRATION_DISPLAY_FIELDS}
          selected={activeRegDisplayKeys}
          max={MAX_REG_DISPLAY_KEYS}
          description={`選擇最多 ${MAX_REG_DISPLAY_KEYS} 個要顯示的欄位（姓名一定會顯示；選了地區會另外顯示在名字下面一行）。`}
          onSave={(keys) => {
            setActiveRegDisplayKeys(keys);
            setShowRegDisplayPicker(false);
          }}
          onCancel={() => setShowRegDisplayPicker(false)}
        />
      </Modal>
    </div>
  );
}
