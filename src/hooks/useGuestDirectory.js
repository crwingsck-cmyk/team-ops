import { useMemo } from "react";

export function useGuestDirectory({ registrations, events, guestDocs }) {
  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  return useMemo(() => {
    const map = new Map();
    const deletedKeys = new Set();
    guestDocs.forEach((doc) => {
      const key = `${(doc.name || "").trim()}|${(doc.phone || "").trim()}`;
      if (doc.deletedAt) {
        deletedKeys.add(key);
        return;
      }
      map.set(key, { key, guestId: doc.id, name: doc.name, phone: doc.phone || "", area: doc.area || "", inviterName: doc.inviterName || "", inviterPhone: doc.inviterPhone || "", notes: doc.notes || "", tcIdentification: "", attendedEvents: [], attendedEventIds: [], records: [] });
    });
    registrations.forEach((r) => {
      if (r.volunteerId) return;
      const key = `${(r.name || "").trim()}|${(r.phone || r.contact || "").trim()}`;
      if (deletedKeys.has(key)) return;
      if (!map.has(key)) {
        map.set(key, { key, name: r.name, phone: r.phone || r.contact || "", area: "", inviterName: "", inviterPhone: "", tcIdentification: "", attendedEvents: [], attendedEventIds: [], records: [] });
      }
      const g = map.get(key);
      if (r.area && !g.area) g.area = r.area;
      if (r.inviterName && !g.inviterName) g.inviterName = r.inviterName;
      if (r.inviterPhone && !g.inviterPhone) g.inviterPhone = r.inviterPhone;
      if (r.tcIdentification) g.tcIdentification = r.tcIdentification;
      if (r.attended) {
        const title = eventsById.get(r.eventId)?.title || r.eventTitle;
        if (title && !g.attendedEvents.includes(title)) g.attendedEvents.push(title);
        if (r.eventId && !g.attendedEventIds.includes(r.eventId)) g.attendedEventIds.push(r.eventId);
      }
      g.records.push(r);
    });
    return [...map.values()].sort((a, b) => b.records.length - a.records.length);
  }, [registrations, guestDocs, eventsById]);
}
