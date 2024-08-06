import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, partiallyProtectedProcedure, protectedProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  currentUser: partiallyProtectedProcedure.query(async ({ ctx }) => {
    const resp = await ctx.prisma.user.findFirst({
      where: {
        firebaseId: ctx.user.firebaseId,
      },
      select: {
        id: true,
        role: true,
        firebaseId: true,
        onboarding: true,
        name: true,
        phone: true,
        image: true
      },
    });

    if (!resp) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    const user = {
      id: resp.id,
      role: resp.role,
      firebaseId: resp.firebaseId,
      onboarding: resp.onboarding,
      name: resp.name,
      phone: resp.phone,
      image: resp.image
    };

    return user;
  }),
  completeOnboarding: protectedProcedure
    .input(z.object({ role: z.enum(["DOCTOR", "PATIENT"]) }))
    .mutation(async ({ ctx, input }) => {
      if (input.role === "DOCTOR") {
        await ctx.prisma.user.update({
          data: {
            onboarding: "IN_PROGRESS",
          },
          where: {
            id: ctx.user.id,
          },
        });
      }

      if (input.role === "PATIENT") {
        await ctx.prisma.user.update({
          data: {
            onboarding: "COMPLETED",
          },
          where: {
            id: ctx.user.id,
          },
        });
      }
    }),
});
