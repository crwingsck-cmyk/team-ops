import { useMemo } from "react";
import { CalendarCheck } from "lucide-react";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { eventFirstDate, dateRangeText } from "../../lib/eventDays";

export default function GuestEventParticipationGrid({ guests, events }) {
  const countsByEvent = useMemo(() => {
    const counts = new Map();
    guests.forEach((g) => {
      (g.attendedEventIds || []).forEach((eventId) => {
        counts.set(eventId, (counts.get(eventId) || 0) + 1);
      });
    });
    return counts;
  }, [guests]);

  const sortedEvents = useMemo(
    () =>
      events
        .filter((event) => (countsByEvent.get(event.id) || 0) > 0)
        .sort((a, b) => eventFirstDate(b).localeCompare(eventFirstDate(a))),
    [events, countsByEvent]
  );

  if (sortedEvents.length === 0) {
    return <EmptyState icon={CalendarCheck} title="還沒有大德參與過任何活動" description="有大德的出席記錄後，這裡就會顯示對應的活動。" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedEvents.map((event) => (
        <Card key={event.id}>
          <h3 className="font-black italic text-slate-800 text-lg mb-1">{event.title}{event.deletedAt ? "（已刪除）" : ""}</h3>
          <p className="text-sm text-slate-500 mb-3">{dateRangeText(event)}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">參與大德人數</p>
          <p className="text-2xl font-black text-slate-800">{countsByEvent.get(event.id) || 0}</p>
        </Card>
      ))}
    </div>
  );
}
