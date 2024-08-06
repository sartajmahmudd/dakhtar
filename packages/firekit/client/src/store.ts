import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

import { app } from "./app";

export const store = () => {
  const _app = app();
  return getStorage(_app);
};

const publicImageStoreRef = (name: string) => {
  const _store = store();
  return ref(_store, `public/images/${name}`);
};

export const uploadToPublicImageStore = async (name: string, file: File) => {
  const storageRef = publicImageStoreRef(name);
  const resp = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(resp.ref);
  return url;
};

const userStoreRef = (name: string) => {
  const _store = store();
  return ref(_store, `users/${name}`);
};

export const uploadToUserStore = async (name: string, file: File) => {
  const storageRef = userStoreRef(name);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
};
