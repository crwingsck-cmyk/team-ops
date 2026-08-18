import { useEffect, useMemo, useState } from "react";
import { Plus, X, Search, ChevronDown, ChevronUp } from "lucide-react";
import Input from "../../components/ui/Input";
import ExpandableTextarea from "../../components/ui/ExpandableTextarea";
import Button from "../../components/ui/Button";
import { chineseIncludes } from "../../lib/chineseSearch";
import MultiSelectFilter from "../../components/ui/MultiSelectFilter";

const EMPTY = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  meetingLink: "",
  hostName: "",
  recorderName: "",
  attendeeIds: [],
  absenteeIds: [],
  purpose: "",
  agendaItems: [],
  otherNotes: "",
  nextMeetingDate: "",
  nextMeetingTime: "",
  nextMeetingTopic: "",
};

function SectionHeading({ children }) {
  return (
    <h4 className="text-sm font-black uppercase tracking-wide text-indigo-600 pt-2 border-t border-slate-100 first:border-t-0 first:pt-0">
      {children}
    </h4>
  );
}

function NameTagList({ label, ids, volunteers, onToggle, activeColor }) {
  const [search, setSearch] = useState("");
  const [huAiFilter, setHuAiFilter] = useState([]);
  const [xieLiFilter, setXieLiFilter] = useState([]);
  const [open, setOpen] = useState(false);

  const huAiOptions = useMemo(
    () => [...new Set(volunteers.map((v) => v.huAi).filter(Boolean))].sort().map((v) => ({ value: v, label: v })),
    [volunteers]
  );
  const xieLiOptions = useMemo(
    () => [...new Set(volunteers.map((v) => v.xieLi).filter(Boolean))].sort().map((v) => ({ value: v, label: v })),
    [volunteers]
  );

  const filtered = volunteers.filter((v) => {
    if (huAiFilter.length > 0 && !huAiFilter.includes(v.huAi)) return false;
    if (xieLiFilter.length > 0 && !xieLiFilter.includes(v.xieLi)) return false;
    if (search && !chineseIncludes(v.name, search)) return false;
    return true;
  });

  const selected = volunteers.filter((v) => ids.includes(v.id));

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-base font-bold text-slate-600 mb-2"
      >
        {label}
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map((v) => (
            <span key={v.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${activeColor}`}>
              {v.name}
              <button type="button" onClick={() => onToggle(v.id)} className="hover:opacity-70">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="點選搜尋或瀏覽名單，例如打「陳」"
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-base hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      {open && (
        <div>
          <div className="flex gap-2 mb-2">
            <MultiSelectFilter label="互愛" options={huAiOptions} selected={huAiFilter} onChange={setHuAiFilter} className="flex-1" />
            <MultiSelectFilter label="協力" options={xieLiOptions} selected={xieLiFilter} onChange={setXieLiFilter} className="flex-1" />
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 rounded-xl border border-slate-200 bg-slate-50">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-400 italic">找不到符合的志工</p>
            ) : (
              filtered.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => onToggle(v.id)}
                  className={`px-4 py-2 rounded-lg text-base font-bold hover:scale-[1.03] transition-all duration-200 ${
                    ids.includes(v.id) ? activeColor : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {v.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MeetingForm({ initial, volunteers, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(
      initial
        ? {
            ...EMPTY,
            ...initial,
            attendeeIds: initial.attendeeIds || [],
            absenteeIds: initial.absenteeIds || [],
            agendaItems: initial.agendaItems || [],
          }
        : EMPTY
    );
  }, [initial]);

  const addAgendaItem = () =>
    setForm((f) => ({ ...f, agendaItems: [...f.agendaItems, { topic: "", summary: "", decision: "" }] }));
  const updateAgendaItem = (i, key, value) =>
    setForm((f) => ({
      ...f,
      agendaItems: f.agendaItems.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)),
    }));
  const removeAgendaItem = (i) =>
    setForm((f) => ({ ...f, agendaItems: f.agendaItems.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const nameOf = (id) => volunteers.find((v) => v.id === id)?.name || "";
    onSubmit({
      ...form,
      hostName: form.hostName.trim(),
      recorderName: form.recorderName.trim(),
      attendeeNamesSnapshot: form.attendeeIds.map(nameOf).filter(Boolean),
      absenteeNamesSnapshot: form.absenteeIds.map(nameOf).filter(Boolean),
      agendaItems: form.agendaItems.filter((item) => item.topic || item.summary || item.decision),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionHeading>基本資訊</SectionHeading>
      <Input label="會議名稱" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Input label="日期" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="開始時間" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
        <Input label="結束時間" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
      </div>
      <Input label="地點（實體地點）" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      <Input
        label="會議連結（Zoom / Teams）"
        value={form.meetingLink}
        onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
        placeholder="https://..."
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="主持人"
          value={form.hostName}
          onChange={(e) => setForm({ ...form, hostName: e.target.value })}
        />
        <Input
          label="記錄人"
          value={form.recorderName}
          onChange={(e) => setForm({ ...form, recorderName: e.target.value })}
        />
      </div>

      {volunteers.length > 0 && (
        <>
          <NameTagList
            label="出席人員"
            ids={form.attendeeIds}
            volunteers={volunteers}
            onToggle={(id) =>
              setForm((f) => ({
                ...f,
                attendeeIds: f.attendeeIds.includes(id) ? f.attendeeIds.filter((a) => a !== id) : [...f.attendeeIds, id],
              }))
            }
            activeColor="bg-indigo-600 text-white"
          />
          <NameTagList
            label="請假 / 缺席人員"
            ids={form.absenteeIds}
            volunteers={volunteers}
            onToggle={(id) =>
              setForm((f) => ({
                ...f,
                absenteeIds: f.absenteeIds.includes(id) ? f.absenteeIds.filter((a) => a !== id) : [...f.absenteeIds, id],
              }))
            }
            activeColor="bg-rose-600 text-white"
          />
        </>
      )}

      <ExpandableTextarea
        label="會議主旨"
        value={form.purpose}
        onChange={(e) => setForm({ ...form, purpose: e.target.value })}
      />

      <SectionHeading>議程與討論摘要</SectionHeading>
      <div className="space-y-3">
        {form.agendaItems.map((item, i) => (
          <div key={i} className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">議程 {i + 1}</span>
              <button type="button" onClick={() => removeAgendaItem(i)} className="text-slate-400 hover:text-rose-600">
                <X size={16} />
              </button>
            </div>
            <Input placeholder="議題名稱" value={item.topic} onChange={(e) => updateAgendaItem(i, "topic", e.target.value)} />
            <ExpandableTextarea
              placeholder="討論重點摘要"
              value={item.summary}
              onChange={(e) => updateAgendaItem(i, "summary", e.target.value)}
            />
            <ExpandableTextarea
              placeholder="會議決議"
              value={item.decision}
              onChange={(e) => updateAgendaItem(i, "decision", e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addAgendaItem} className="text-base text-indigo-600 font-bold flex items-center gap-1">
          <Plus size={16} /> 新增議程項目
        </button>
      </div>

      <SectionHeading>其他重要備註</SectionHeading>
      <ExpandableTextarea
        label="待搜集資訊 / 待外部確認事項"
        value={form.otherNotes}
        onChange={(e) => setForm({ ...form, otherNotes: e.target.value })}
      />
      <Input
        label="下次會議日期"
        type="date"
        value={form.nextMeetingDate}
        onChange={(e) => setForm({ ...form, nextMeetingDate: e.target.value })}
      />
      <Input
        label="下次會議時間"
        type="time"
        value={form.nextMeetingTime}
        onChange={(e) => setForm({ ...form, nextMeetingTime: e.target.value })}
      />
      <ExpandableTextarea
        label="初步議題"
        value={form.nextMeetingTopic}
        onChange={(e) => setForm({ ...form, nextMeetingTopic: e.target.value })}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
