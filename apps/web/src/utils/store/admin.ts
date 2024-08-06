import { atom, useAtom } from "jotai";

import type { RouterOutputs } from "@dakthar/api";

export type Appointment =
  RouterOutputs["appointment"]["getAllAppointments"]["appointments"][number];

export type AdminDoctor =
  RouterOutputs["doctor"]["getAllDoctors"]["doctors"][number];

const doctorAtom = atom<AdminDoctor | null>(null);
export const useSelectedDoctor = () => useAtom(doctorAtom);

const showEditDocotorAtom = atom(false);
export const useShowEditDoctor = () => useAtom(showEditDocotorAtom);
