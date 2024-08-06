import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";

import type { RouterOutputs } from "@dakthar/api";
import {
  decreaseSerialPosition,
  increaseSerialPosition,
  onSnapshot,
  serialCollection,
  updateSerial,
} from "@dakthar/firekit-client";
import type { SerialOutput } from "@dakthar/firekit-client";

// ! prolly remove this later
const tryCatchWrapper = <T>(fn: () => Promise<T>) => {
  try {
    return fn();
  } catch (error) {
    console.error(error);
  }
};

export const useLiveAppointment = (doctorSlug: string) => {
  const [data, setData] = useState<SerialOutput | null>(null);

  const increaseCount = async () => {
    await tryCatchWrapper(() => increaseSerialPosition(doctorSlug));
  };
  const decreaseCount = async () => {
    if (!data?.position || data.position === 0) {
      return;
    }
    await tryCatchWrapper(() => decreaseSerialPosition(doctorSlug));
  };

  const resetCount = async () => {
    await tryCatchWrapper(() =>
      updateSerial(doctorSlug, {
        position: 0,
        live: false,
        timestamp: new Date(),
      }),
    );
  };

  const updateCount = async (position: number) => {
    await tryCatchWrapper(() =>
      updateSerial(doctorSlug, {
        position,
        live: true,
        timestamp: new Date(),
      }),
    );
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(serialCollection(doctorSlug), (doc) => {
      const serialInfo = doc.data() as SerialOutput;
      setData(serialInfo);
    });

    return () => unsubscribe();
  }, [doctorSlug]);

  return { data, increaseCount, decreaseCount, resetCount, updateCount };
};

type PatientAppointmentInfo =
  RouterOutputs["appointment"]["getMyAppointmentsForDoctor"]["appointments"][number] & {
    role: "PATIENT";
  };

type DoctorAppointmentInfo =
  RouterOutputs["appointment"]["getMyAppointmentsForPatient"]["appointments"][number] & {
    role: "DOCTOR";
  };

const appointmentDetailsAtom = atom<
  DoctorAppointmentInfo | PatientAppointmentInfo | null
>(null);
export const useAppointmentDetails = () => useAtom(appointmentDetailsAtom);
