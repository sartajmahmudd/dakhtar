import dayjs from "dayjs";
import { z } from "zod";

export const BANGLADESHI_PHONE_NUMBER_REGEX = /^(?:\+?88)?01\d{9}$/;

export const AppointmentType = {
  IN_PERSON: "IN_PERSON",
  ONLINE: "ONLINE",
} as const;

export const GenderOptions = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export const appointmentDetailsSchema = z.object({
  date: z
    .string()
    .min(1)
    .refine((val) => dayjs(val).isValid(), {
      message: "Invalid date",
    }),
  time: z.string().min(1),
  location: z.string(),
  type: z.nativeEnum(AppointmentType),
  fee: z.number().positive(),
  doctorSlug: z.string().min(1),
});

export type AppointmentDetails = z.infer<typeof appointmentDetailsSchema>;

export const userDetailsSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z
    .string()
    .min(1)
    .refine((val) => dayjs(val).isValid(), {
      message: "Invalid date",
    })
    .optional()
    .nullable(),
  gender: z.nativeEnum(GenderOptions),
  phone: z.string().regex(BANGLADESHI_PHONE_NUMBER_REGEX),
  email: z
    .string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true;
      return z.string().email().safeParse(val).success;
    }),
});

export type UserDetails = z.infer<typeof userDetailsSchema>;
