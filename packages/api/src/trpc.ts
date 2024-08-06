import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import jwt from "jsonwebtoken";
import superjson from "superjson";
import { ZodError } from "zod";

import type { Role } from "@dakthar/db";
import { prisma } from "@dakthar/db";
import { db as drizzle } from "@dakthar/db2";
import { admin } from "@dakthar/firekit-server";

import { env } from "../env.mjs";

// type CreateContextOptions = Record<string, never>;

interface User {
  id?: number;
  firebaseId: string;
  role?: Role;
}

interface CreateContextOptions {
  user: User | null;
  token: string | null;
}

const createInnerTRPCContext = (_opts: CreateContextOptions) => {
  return {
    user: _opts.user,
    token: _opts.token,
    prisma,
    drizzle,
  };
};

export const createTRPCContext = async (_opts: CreateNextContextOptions) => {
  const { req } = _opts;
  const token = req.cookies?.session ?? "";
  const claim = req.cookies?.claim ?? "";

  if (!token && !claim) {
    return createInnerTRPCContext({
      user: null,
      token: null,
    });
  }

  try {
    const decodedToken = await admin().auth().verifySessionCookie(token);
    const customClaims = jwt.verify(claim, env.JWT_SECRET) as unknown as {
      id: number;
      role: Role;
    };

    if (!customClaims?.id || !customClaims?.role) {
      const user = {
        firebaseId: decodedToken.uid,
      };

      return createInnerTRPCContext({ user, token });
    }

    const user = {
      firebaseId: decodedToken.uid,
      role: customClaims.role,
      id: Number(customClaims.id),
    };

    return createInnerTRPCContext({ user, token });
  } catch (error) {
    if (error instanceof Error && error?.message) {
      console.error(error.message);
    }
    return createInnerTRPCContext({
      user: null,
      token: null,
    });
  }
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthedCompletely = t.middleware(({ ctx, next }) => {
  if (!ctx?.user?.id || !ctx?.user?.role) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = {
    id: ctx.user.id,
    role: ctx.user.role,
    firebaseId: ctx.user.firebaseId,
  };

  return next({
    ctx: {
      user,
    },
  });
});

const enforceUserIsAuthedPartially = t.middleware(({ ctx, next }) => {
  if (!ctx.token || !ctx.user?.firebaseId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = {
    firebaseId: ctx.user.firebaseId,
  };

  return next({
    ctx: {
      user,
      token: ctx.token,
    },
  });
});

export const protectedProcedure = t.procedure.use(
  enforceUserIsAuthedCompletely,
);
export const partiallyProtectedProcedure = t.procedure.use(
  enforceUserIsAuthedPartially,
);
