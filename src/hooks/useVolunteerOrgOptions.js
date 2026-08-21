import { useMemo } from "react";
import { useCollection } from "./useCollection";

export function useVolunteerOrgOptions() {
  const { data: volunteers, loading } = useCollection("volunteers");
  const heQiOptions = useMemo(() => [...new Set(volunteers.map((v) => v.heQi).filter(Boolean))].sort(), [volunteers]);
  const huAiOptions = useMemo(() => [...new Set(volunteers.map((v) => v.huAi).filter(Boolean))].sort(), [volunteers]);
  const xieLiOptions = useMemo(() => [...new Set(volunteers.map((v) => v.xieLi).filter(Boolean))].sort(), [volunteers]);
  const volunteerOptions = useMemo(() => volunteers.map((v) => ({ id: v.id, name: v.name, phone: v.phone || "" })), [volunteers]);
  return { heQiOptions, huAiOptions, xieLiOptions, volunteerOptions, loading };
}
