import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Users2, Upload, Trash2, MapPin, Calendar, Users, Search, Settings2 } from "lucide-react";
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
import { getDays } from "../../lib/eventDays";
import { chineseIncludes } from "../../lib/chineseSearch";

function tcIdentificationLabel(key) {
  return TC_IDENTIFICATION_LABELS[key]?.split(" ")[0] || "";
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
  };
}

const REGISTRATION_FILTER_FIELDS = [
  { key: "tcIdentification", label: "慈濟身份" },
  { key: "gender", label: "性別", source: "raw" },
  { key: "attendingDates", label: "參與日期", array: true, source: "raw" },
  { key: "area", label: "住的地區", source: "raw" },
  { key: "invitedBy", label: "邀約人姓名", source: "raw" },
  { key: "participantCount", label: "同行人數", source: "raw" },
  { key: "heQi", label: "和氣" },
  { key: "huAi", label: "互愛" },
  { key: "xieLi", label: "協力" },
];
const DEFAULT_REG_FILTER_KEYS = ["tcIdentification", "attendingDates", "xieLi"];

export default function EventDetail({ event, isAdmin, onBack }) {
  const { data: volunteers } = useCollection("volunteers");
  const { data: allRegistrations, loading } = useCollection("registrations");
  const { create, update, remove } = useFirestoreCrud("registrations");

  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingOne, setDeletingOne] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [regSearch, setRegSearch] = useState("");
  const [activeRegFilterKeys, setActiveRegFilterKeys] = useState(DEFAULT_REG_FILTER_KEYS);
  const [regFilterValues, setRegFilterValues] = useState({});
  const [showRegFieldPicker, setShowRegFieldPicker] = useState(false);

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
    const counts = {};
    Object.keys(REGISTRATION_STATUS).forEach((k) => { counts[k] = 0; });
    registrations.forEach((r) => { if (counts[r.status] !== undefined) counts[r.status] += 1; });
    return counts;
  }, [registrations]);

  const regFieldOptionsMap = useMemo(() => {
    const map = {};
    REGISTRATION_FILTER_FIELDS.forEach((f) => {
      if (f.key === "tcIdentification") {
        map[f.key] = Object.keys(TC_IDENTIFICATION_LABELS).map((k) => ({ value: k, label: tcIdentificationLabel(k) }));
        return;
      }
      if (f.key === "gender") {
        map[f.key] = Object.entries(GENDER_LABELS).map(([k, v]) => ({ value: k, label: v }));
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
      if (statusFilter !== "all" && r.raw.status !== statusFilter) return false;
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
      return chineseIncludes(`${r.name} ${r.phone || ""}`, regSearch);
    });
  }, [resolvedRegistrations, statusFilter, activeRegFilterKeys, regFilterValues, regSearch]);

  const registeredVolunteerIds = useMemo(
    () => new Set(registrations.map((r) => r.volunteerId).filter(Boolean)),
    [registrations]
  );

  const handleSubmit = async (data) => {
    await create({ ...data, eventId: event.id });
    setShowForm(false);
  };

  const handleBulkSubmit = async (selectedVolunteers, status) => {
    for (const v of selectedVolunteers) {
      await create({
        eventId: event.id,
        volunteerId: v.id,
        name: v.name,
        phone: v.phone || "",
        tcIdentification: v.tcIdentification || "",
        heQi: v.heQi || "",
        huAi: v.huAi || "",
        xieLi: v.xieLi || "",
        notes: "",
        status,
      });
    }
    setShowBulkForm(false);
  };

  const handleImportSubmit = async (data) => {
    await create({ ...data, eventId: event.id });
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black italic text-slate-700 text-xl flex items-center gap-2">
            <Users size={20} /> 報名名單（{registrations.length}{event.capacity ? ` / ${event.capacity}` : ""}）
          </h3>
          <div className="flex gap-2">
            {isAdmin && registrations.length > 0 && (
              <Button variant="danger" icon={Trash2} onClick={() => setConfirmDeleteAll(true)}>刪除全部報名</Button>
            )}
            <Button variant="secondary" icon={Upload} onClick={() => setShowImportForm(true)}>匯入 Excel</Button>
            <Button variant="secondary" icon={Users2} onClick={() => setShowBulkForm(true)}>志工報名</Button>
            <Button icon={Plus} onClick={() => setShowForm(true)}>新增大德報名</Button>
          </div>
        </div>

        {registrations.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                statusFilter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              全部（{registrations.length}）
            </button>
            {Object.entries(REGISTRATION_STATUS).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setStatusFilter(k)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  statusFilter === k ? `${v.bg} ${v.text}` : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                }`}
              >
                {v.label}（{statusCounts[k]}）
              </button>
            ))}
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
              return (
              <li key={r.id} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 hover:scale-[1.02] transition-all duration-200">
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-4 gap-3 items-center min-w-0">
                    <span className="font-bold text-xl text-slate-800 truncate">{registrant.name}</span>
                    <span className="text-base text-slate-500 truncate">{registrant.phone || "-"}</span>
                    <span className="text-base text-slate-500 truncate">{tcIdentificationLabel(registrant.tcIdentification) || "-"}</span>
                    <span className="text-base text-slate-500 truncate">{registrant.heqiHuaiXieli || "-"}</span>
                  </div>
                  {(r.gender || r.participantCount > 1 || r.invitedBy || r.area || r.attendingDates?.length > 0) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                      {r.gender && <span>{GENDER_LABELS[r.gender] || r.gender}</span>}
                      {r.participantCount > 1 && <span>共 {r.participantCount} 人</span>}
                      {r.invitedBy && <span>邀約人：{r.invitedBy}</span>}
                      {r.area && <span>地區：{r.area}</span>}
                      {r.attendingDates?.length > 0 && <span>參與日期：{r.attendingDates.join("、")}</span>}
                    </div>
                  )}
                  {r.notes && <p className="text-base italic text-slate-500 mt-1">{r.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select
                    value={r.status}
                    onChange={(e) => update(r.id, { status: e.target.value })}
                    className={`!py-1.5 !text-sm w-32 ${registrationStatusSelectClass(r.status)}`}
                  >
                    {Object.entries(REGISTRATION_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </Select>
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
        <RegistrationForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal open={showBulkForm} onClose={() => setShowBulkForm(false)} title="志工報名">
        <BulkRegistrationForm
          volunteers={volunteers}
          alreadyRegisteredIds={registeredVolunteerIds}
          onSubmit={handleBulkSubmit}
          onCancel={() => setShowBulkForm(false)}
        />
      </Modal>

      <Modal open={showImportForm} onClose={() => setShowImportForm(false)} title="匯入 Excel">
        <RegistrationImportModal
          existingRegistrations={registrations}
          onImport={handleImportSubmit}
          onClose={() => setShowImportForm(false)}
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
    </div>
  );
}
