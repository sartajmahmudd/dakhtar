import { appointmentRouter } from "./routers/appointment";
import { authRouter } from "./routers/auth";
import { doctorRouter } from "./routers/doctor";
import { prescriptionRouter } from "./routers/prescription";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  doctor: doctorRouter,
  appointment: appointmentRouter,
  prescription: prescriptionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
