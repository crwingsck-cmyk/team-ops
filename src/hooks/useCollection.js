import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

const ROOT_PATH = ["team-ops", "v1"];

export function colRef(collectionName) {
  return collection(db, ...ROOT_PATH, collectionName);
}

export function docRef(collectionName, id) {
  return doc(db, ...ROOT_PATH, collectionName, id);
}

export function useCollection(
  collectionName,
  { orderByField, orderByDirection = "asc", includeDeleted = false, onlyDeleted = false, enabled = true } = {}
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = orderByField
      ? query(colRef(collectionName), orderBy(orderByField, orderByDirection))
      : colRef(collectionName);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let docs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        if (onlyDeleted) {
          docs = docs.filter((d) => d.deletedAt);
        } else if (!includeDeleted) {
          docs = docs.filter((d) => !d.deletedAt);
        }
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, orderByField, orderByDirection, includeDeleted, onlyDeleted, enabled]);

  return { data, loading, error };
}
