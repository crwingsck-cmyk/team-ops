import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { CalendarCheck } from "lucide-react";
import { dateRangeText } from "../../lib/eventDays";

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  );
}

export default function EventAttendanceSummaryGrid({ events, registrations }) {
  if (events.length === 0) {
    return <EmptyState icon={CalendarCheck} title="沒有符合條件的活動" description="調整篩選條件，或確認活動資料庫裡已經有資料。" />;
  }

  const regsByEvent = new Map();
  registrations.forEach((r) => {
    if (!regsByEvent.has(r.eventId)) regsByEvent.set(r.eventId, []);
    regsByEvent.get(r.eventId).push(r);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => {
        const regs = regsByEvent.get(event.id) || [];
        const headcount = (r) => Number(r.childrenCount) || 1;
        const attendedHeadcount = (r) => Number(r.attendedChildrenCount ?? r.childrenCount) || 1;
        const sumHeadcount = (list) => list.reduce((sum, r) => sum + headcount(r), 0);
        const attendedCount = regs.filter((r) => r.attended).reduce((sum, r) => sum + attendedHeadcount(r), 0);
        const registeredCount = sumHeadcount(regs.filter((r) => r.status !== "waitlisted"));
        const waitlistedCount = sumHeadcount(regs.filter((r) => r.status === "waitlisted"));
        const cancelledCount = sumHeadcount(regs.filter((r) => r.status === "cancelled"));
        return (
          <Card key={event.id}>
            <h3 className="font-black italic text-slate-800 text-lg mb-1">{event.title}{event.deletedAt ? "（已刪除）" : ""}</h3>
            <p className="text-sm text-slate-500 mb-3">{dateRangeText(event)}</p>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="出席人數" value={attendedCount} />
              <Stat label="已報名人數" value={registeredCount} />
              <Stat label="考慮中人數" value={waitlistedCount} />
              <Stat label="無法出席人數" value={cancelledCount} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
