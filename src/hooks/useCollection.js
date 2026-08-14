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

export function useCollection(collectionName, { orderByField, orderByDirection = "asc" } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const q = orderByField
      ? query(colRef(collectionName), orderBy(orderByField, orderByDirection))
      : colRef(collectionName);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, orderByField, orderByDirection]);

  return { data, loading, error };
}
