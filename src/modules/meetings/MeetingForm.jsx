import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const EMPTY = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  meetingLink: "",
  hostId: "",
  recorderId: "",
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

  const toggle = (key, id) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter((a) => a !== id) : [...f[key], id],
    }));
  };

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
      hostName: nameOf(form.hostId),
      recorderName: nameOf(form.recorderId),
      attendeeNamesSnapshot: form.attendeeIds.map(nameOf).filter(Boolean),
      absenteeNamesSnapshot: form.absenteeIds.map(nameOf).filter(Boolean),
      agendaItems: form.agendaItems.filter((item) => item.topic || item.summary || item.decision),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SectionHeading>基本資訊</SectionHeading>
      <Input label="會議名稱" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <div className="grid grid-cols-3 gap-3">
        <Input label="日期" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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
        <Select label="主持人" value={form.hostId} onChange={(e) => setForm({ ...form, hostId: e.target.value })}>
          <option value="">（未指定）</option>
          {volunteers.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </Select>
        <Select label="記錄人" value={form.recorderId} onChange={(e) => setForm({ ...form, recorderId: e.target.value })}>
          <option value="">（未指定）</option>
          {volunteers.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </Select>
      </div>

      {volunteers.length > 0 && (
        <>
          <div>
            <span className="block text-base font-bold text-slate-600 mb-2">出席人員</span>
            <div className="flex flex-wrap gap-2">
              {volunteers.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => toggle("attendeeIds", v.id)}
                  className={`px-4 py-2 rounded-lg text-base font-bold hover:scale-[1.03] transition-all duration-200 ${
                    form.attendeeIds.includes(v.id) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="block text-base font-bold text-slate-600 mb-2">請假 / 缺席人員</span>
            <div className="flex flex-wrap gap-2">
              {volunteers.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => toggle("absenteeIds", v.id)}
                  className={`px-4 py-2 rounded-lg text-base font-bold hover:scale-[1.03] transition-all duration-200 ${
                    form.absenteeIds.includes(v.id) ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <Textarea
        label="會議主旨（本次會議欲達成目標）"
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
            <Textarea
              placeholder="討論重點摘要"
              rows={2}
              value={item.summary}
              onChange={(e) => updateAgendaItem(i, "summary", e.target.value)}
            />
            <Input placeholder="會議決議" value={item.decision} onChange={(e) => updateAgendaItem(i, "decision", e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={addAgendaItem} className="text-base text-indigo-600 font-bold flex items-center gap-1">
          <Plus size={16} /> 新增議程項目
        </button>
      </div>

      <SectionHeading>其他重要備註</SectionHeading>
      <Textarea
        label="待搜集資訊 / 待外部確認事項"
        value={form.otherNotes}
        onChange={(e) => setForm({ ...form, otherNotes: e.target.value })}
      />
      <div className="grid grid-cols-3 gap-3">
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
        <Input
          label="初步議題"
          value={form.nextMeetingTopic}
          onChange={(e) => setForm({ ...form, nextMeetingTopic: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">儲存</Button>
      </div>
    </form>
  );
}
