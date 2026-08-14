import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./useAuth";

export function useMembership() {
  const { user, loading: authLoading } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsMember(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(db, "team-ops", "v1", "members", user.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setIsMember(snap.exists());
        setLoading(false);
      },
      () => {
        setIsMember(false);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user, authLoading]);

  return { isMember, loading: authLoading || loading };
}
