import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    WEBHOOK_FIREBASE_SECRET: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    BOOMCAST_USERNAME: z.string().min(1),
    BOOMCAST_PASSWORD: z.string().min(1),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    BOOMCAST_USERNAME: process.env.BOOMCAST_USERNAME,
    BOOMCAST_PASSWORD: process.env.BOOMCAST_PASSWORD,
    DATABASE_URL: process.env.DATABASE_URL,
    WEBHOOK_FIREBASE_SECRET: process.env.WEBHOOK_FIREBASE_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
