import { useCallback } from "react";
import { addDoc, deleteDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { colRef, docRef } from "./useCollection";
import { useAuth } from "./useAuth";

export function useFirestoreCrud(collectionName) {
  const { user } = useAuth();

  const create = useCallback(
    async (data) => {
      const createdBy = user ? { uid: user.uid, name: user.displayName || user.email || "未知使用者" } : null;
      return addDoc(colRef(collectionName), {
        ...data,
        createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [collectionName, user]
  );

  const update = useCallback(
    async (id, data) => {
      return updateDoc(docRef(collectionName, id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
    [collectionName]
  );

  const remove = useCallback(
    async (id) => {
      return deleteDoc(docRef(collectionName, id));
    },
    [collectionName]
  );

  const getOne = useCallback(
    async (id) => {
      const snap = await getDoc(docRef(collectionName, id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    [collectionName]
  );

  return { create, update, remove, getOne };
}
