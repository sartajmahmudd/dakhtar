import dayjs from "dayjs";
import { atom, useAtom } from "jotai";
import { create } from "zustand";

import { AppointmentType } from "@dakthar/db";
import type { AppointmentDetails, UserDetails } from "@dakthar/shared";
import { GenderOptions } from "@dakthar/shared";

interface AppointmentStore {
  appointmentDetails: AppointmentDetails;
  userDetails: UserDetails;
  setAppointmentDetails: (newState: Partial<AppointmentDetails>) => void;
  setUserDetails: (newState: Partial<UserDetails>) => void;
}

const initialAppointmentData = {
  date: dayjs().format(),
  time: "",
  location: "default-selected-location",
  type: AppointmentType.IN_PERSON,
  fee: 0,
  doctorSlug: "",
};

const initialUserData = {
  name: "",
  dateOfBirth: "",
  gender: GenderOptions.MALE,
  phone: "",
};

// ! The implementations of setter fns are not type safe
export const useAppointmentStore = create<AppointmentStore>((set) => ({
  appointmentDetails: initialAppointmentData,
  userDetails: initialUserData,
  setAppointmentDetails: (newState) =>
    set((state) => ({
      appointmentDetails: { ...state.appointmentDetails, ...newState },
    })),
  setUserDetails: (newState) => {
    set((state) => ({
      userDetails: { ...state.userDetails, ...newState },
    }));
  },
}));

const appointmentSubmitAtom = atom(false);
export const useAppointmentSubmitAtom = () => useAtom(appointmentSubmitAtom);
