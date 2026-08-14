import { useCallback, useMemo } from "react";
import { addDoc, deleteDoc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { colRef, docRef } from "./useCollection";
import { useAuth } from "./useAuth";

function labelFor(data) {
  return data?.title ?? data?.name ?? data?.description ?? "未命名";
}

export function useFirestoreCrud(collectionName) {
  const { user } = useAuth();
  const actor = useMemo(
    () => (user ? { uid: user.uid, name: user.displayName || user.email || "未知使用者" } : null),
    [user]
  );

  const logActivity = useCallback(
    async (action, id, label) => {
      if (!actor) return;
      await addDoc(colRef("activityLog"), {
        action,
        collectionName,
        docId: id,
        label,
        userId: actor.uid,
        userName: actor.name,
        at: serverTimestamp(),
      });
    },
    [collectionName, actor]
  );

  const create = useCallback(
    async (data) => {
      const docRefResult = await addDoc(colRef(collectionName), {
        ...data,
        createdBy: actor,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logActivity("create", docRefResult.id, labelFor(data));
      return docRefResult;
    },
    [collectionName, actor, logActivity]
  );

  const update = useCallback(
    async (id, data) => {
      const existing = await getDoc(docRef(collectionName, id));
      await updateDoc(docRef(collectionName, id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      await logActivity("update", id, labelFor(existing.data()));
    },
    [collectionName, logActivity]
  );

  const remove = useCallback(
    async (id) => {
      const existing = await getDoc(docRef(collectionName, id));
      await updateDoc(docRef(collectionName, id), {
        deletedAt: serverTimestamp(),
        deletedBy: actor,
      });
      await logActivity("delete", id, labelFor(existing.data()));
    },
    [collectionName, actor, logActivity]
  );

  const restore = useCallback(
    async (id) => {
      const existing = await getDoc(docRef(collectionName, id));
      await updateDoc(docRef(collectionName, id), {
        deletedAt: null,
        deletedBy: null,
      });
      await logActivity("restore", id, labelFor(existing.data()));
    },
    [collectionName, logActivity]
  );

  const permanentlyDelete = useCallback(
    async (id) => {
      const existing = await getDoc(docRef(collectionName, id));
      const label = labelFor(existing.data());
      await deleteDoc(docRef(collectionName, id));
      await logActivity("purge", id, label);
    },
    [collectionName, logActivity]
  );

  const getOne = useCallback(
    async (id) => {
      const snap = await getDoc(docRef(collectionName, id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },
    [collectionName]
  );

  return { create, update, remove, restore, permanentlyDelete, getOne };
}
