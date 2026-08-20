import { useMemo } from "react";
import { useCollection } from "./useCollection";

// Not a real volunteer — a fixed row so donations with no known solicitor
// still have somewhere to be recorded (personKey "unassigned" in fundraisingRecords).
export const UNASSIGNED_VOLUNTEER_ID = "unassigned";

export function useFundraisingPeople() {
  const { data: volunteers, loading: loadingVolunteers } = useCollection("volunteers");
  const { data: fundraisingRecords, loading: loadingRecords } = useCollection("fundraisingRecords");

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
    const unassignedRow = {
      id: UNASSIGNED_VOLUNTEER_ID,
      category: "志工",
      name: "未指定志工（募款人不明）",
      phone: "",
      tcIdentification: "",
      heQi: "",
      huAi: "",
      xieLi: "",
      area: "",
      notes: "",
    };
    return [unassignedRow, ...volunteerRows].map((p) => {
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

  const loading = loadingVolunteers || loadingRecords;

  return { people, heQiOptions, huAiOptions, xieLiOptions, loading };
}
