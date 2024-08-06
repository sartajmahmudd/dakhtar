import type { Timestamp } from "firebase/firestore";
import { doc, getFirestore, increment, setDoc } from "firebase/firestore";
import { z } from "zod";

import { app } from "./app";

const serialSchema = z.object({
  position: z.number().int().nonnegative(),
  timestamp: z.date(),
  live: z.boolean(),
});

export type SerialInput = z.infer<typeof serialSchema>;
export type SerialOutput = Omit<SerialInput, "timestamp"> & {
  timestamp: Timestamp;
};

const db = () => {
  const _app = app();
  return getFirestore(_app);
};

export const serialCollection = (doctorSlug: string) => {
  return doc(db(), "serials", doctorSlug);
};

export const updateSerial = async (doctorSlug: string, serial: SerialInput) => {
  const serialRef = serialCollection(doctorSlug);
  await setDoc(serialRef, serialSchema.parse(serial), { merge: true });
};

export const increaseSerialPosition = async (doctorSlug: string) => {
  const serialRef = serialCollection(doctorSlug);
  await setDoc(
    serialRef,
    { position: increment(1), timestamp: new Date(), live: true },
    { merge: true },
  );
};

export const decreaseSerialPosition = async (doctorSlug: string) => {
  const serialRef = serialCollection(doctorSlug);
  await setDoc(
    serialRef,
    { position: increment(-1), timestamp: new Date(), live: true },
    { merge: true },
  );
};
