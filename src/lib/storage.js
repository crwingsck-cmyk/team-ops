import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadImage(file, folder) {
  const path = `team-ops/v1/${folder}/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return { url, path };
}

export async function deleteImage(path) {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // already gone or never existed — nothing to clean up
  }
}
