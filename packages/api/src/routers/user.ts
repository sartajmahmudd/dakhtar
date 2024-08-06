import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { z } from "zod";

import { Role } from "@dakthar/db";
import { GenderOptions } from "@dakthar/shared";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const updateUserSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z
    .string()
    .min(1)
    .refine((val) => dayjs(val).isValid(), {
      message: "Invalid date",
    }),
  role: z.enum(["PATIENT", "DOCTOR"]),
  gender: z.nativeEnum(GenderOptions),
  email: z
    .string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true;
      return z.string().email().safeParse(val).success;
    }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        dateOfBirth: z.string().datetime().optional(),
        email: z.string().email().optional(),
        phone: z.string().min(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, phone, dateOfBirth } = input;
      const user = await ctx.prisma.user.create({
        data: {
          name,
          phone,
          email: email ?? null,
          dateOfBirth: dateOfBirth ?? null,
          role: "PATIENT",
        },
      });

      return { user };
    }),
  createUserFromAdmin: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        dateOfBirth: z
          .string()
          .min(1)
          .refine((val) => dayjs(val).isValid(), {
            message: "Invalid date",
          }),
        email: z.string().email().optional().nullable(),
        phone: z.string().min(10),
        role: z.nativeEnum(Role),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, phone, dateOfBirth, role } = input;

      const onboardingStatus = role === "PATIENT" ? "COMPLETED" : "IN_PROGRESS";

      const user = await ctx.prisma.user.create({
        data: {
          name,
          phone,
          email: email ?? null,
          dateOfBirth: dateOfBirth ?? null,
          role: role,
          onboarding: onboardingStatus,
        },
      });

      if (role === "PATIENT") {
        await ctx.prisma.patient.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });
      }

      return { user };
    }),
  getUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return {
      name: user.name,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      role: user.role,
      onboarding: user.onboarding,
    };
  }),
  getUserPatientId: protectedProcedure.input(z.object({
    userId: z.number()
  }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.patient.findFirst({
        where: {
          userId: input.userId
        },
        select: {
          id: true
        }
      })

      if (!res) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { patientId: res.id }
    }),
  updateUser: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, email, dateOfBirth, gender, role } = input;

      const onboarding =
        role === "PATIENT"
          ? "COMPLETED"
          : role === "DOCTOR"
            ? "IN_PROGRESS"
            : "NOT_STARTED";

      const user = await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          name,
          email: email ?? null,
          dateOfBirth: dateOfBirth ?? null,
          gender,
          role,
          onboarding,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      if (role === "PATIENT") {
        await ctx.prisma.patient.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });
      }

      if (!user) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return {
        success: true,
        message: "User updated successfully",
      };
    }),
});
