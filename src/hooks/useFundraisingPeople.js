import { useMemo } from "react";
import { useCollection } from "./useCollection";
import { useGuestDirectory } from "./useGuestDirectory";

export function useFundraisingPeople() {
  const { data: volunteers, loading: loadingVolunteers } = useCollection("volunteers");
  const { data: guestDocs, loading: loadingGuests } = useCollection("guests");
  const { data: registrations, loading: loadingRegs } = useCollection("registrations");
  const { data: events, loading: loadingEvents } = useCollection("events", { includeDeleted: true });
  const { data: fundraisingRecords, loading: loadingRecords } = useCollection("fundraisingRecords");

  const guests = useGuestDirectory({ registrations, events, guestDocs });

  const recordsByPersonKey = useMemo(
    () => new Map(fundraisingRecords.map((r) => [r.personKey, r])),
    [fundraisingRecords]
  );

  const people = useMemo(() => {
    const volunteerRows = volunteers.map((v) => ({
      id: `v:${v.id}`,
      category: "志工",
      name: v.name,
      phone: v.phone || "",
      tcIdentification: v.tcIdentification || "",
      heQi: v.heQi || "",
      huAi: v.huAi || "",
      xieLi: v.xieLi || "",
      area: v.address || "",
      notes: v.notes || "",
    }));
    return volunteerRows.map((p) => {
      const record = recordsByPersonKey.get(p.id);
      const donors = record?.donors || [];
      return {
        ...p,
        recordId: record?.id || null,
        donors,
        amount: donors.reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
        pledgeTarget: record?.pledgeTarget ?? "",
      };
    });
  }, [volunteers, recordsByPersonKey]);

  const heQiOptions = useMemo(() => [...new Set(volunteers.map((v) => v.heQi).filter(Boolean))].sort(), [volunteers]);
  const huAiOptions = useMemo(() => [...new Set(volunteers.map((v) => v.huAi).filter(Boolean))].sort(), [volunteers]);
  const xieLiOptions = useMemo(() => [...new Set(volunteers.map((v) => v.xieLi).filter(Boolean))].sort(), [volunteers]);

  const loading = loadingVolunteers || loadingGuests || loadingRegs || loadingEvents || loadingRecords;

  return { people, guestDirectory: guests, heQiOptions, huAiOptions, xieLiOptions, loading };
}
