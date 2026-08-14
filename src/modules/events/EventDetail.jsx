import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2, MapPin, Calendar, Users } from "lucide-react";
import { useCollection } from "../../hooks/useCollection";
import { useFirestoreCrud } from "../../hooks/useFirestoreCrud";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import RegistrationForm from "./RegistrationForm";

export default function EventDetail({ event, isAdmin, onBack }) {
  const { data: volunteers } = useCollection("volunteers");
  const { data: allRegistrations, loading } = useCollection("registrations");
  const { create, update, remove } = useFirestoreCrud("registrations");

  const [showForm, setShowForm] = useState(false);

  const registrations = useMemo(
    () => allRegistrations.filter((r) => r.eventId === event.id),
    [allRegistrations, event.id]
  );

  const handleSubmit = async (data) => {
    await create({ ...data, eventId: event.id });
    setShowForm(false);
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-4">
        <ArrowLeft size={14} /> 回到活動列表
      </button>

      <Card className="mb-6">
        <h2 className="text-2xl font-black italic text-slate-800 mb-3">{event.title}</h2>
        {event.description && <p className="text-lg text-slate-600 mb-4 whitespace-pre-wrap">{event.description}</p>}
        <div className="flex flex-wrap gap-4 text-base text-slate-600">
          <span className="flex items-center gap-1.5"><Calendar size={17} />{event.date}{event.startTime && ` ${event.startTime}${event.endTime ? `-${event.endTime}` : ""}`}</span>
          {event.location && <span className="flex items-center gap-1.5"><MapPin size={17} />{event.location}</span>}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black italic text-slate-700 text-xl flex items-center gap-2">
            <Users size={20} /> 報名名單（{registrations.length}{event.capacity ? ` / ${event.capacity}` : ""}）
          </h3>
          <Button icon={Plus} onClick={() => setShowForm(true)}>新增報名</Button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 italic">載入中...</div>
        ) : registrations.length === 0 ? (
          <EmptyState icon={Users} title="還沒有人報名" />
        ) : (
          <ul className="space-y-2">
            {registrations.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 hover:scale-[1.02] transition-all duration-200">
                <div>
                  <p className="font-bold text-xl text-slate-800">{r.name}</p>
                  {r.contact && <p className="text-base text-slate-500">{r.contact}</p>}
                  {r.notes && <p className="text-base text-slate-500 mt-0.5">{r.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={r.status} onChange={(e) => update(r.id, { status: e.target.value })} className="!py-1.5 !text-sm w-32">
                    <option value="registered">已報名</option>
                    <option value="waitlisted">候補</option>
                    <option value="cancelled">已取消</option>
                  </Select>
                  {isAdmin && (
                    <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-rose-600">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="新增報名">
        <RegistrationForm volunteers={volunteers} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
