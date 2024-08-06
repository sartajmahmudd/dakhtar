import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({
  path: "../../.env",
});

if (!process.env.DB2_DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default {
  schema: "./schema",
  driver: "mysql2",
  dbCredentials: {
    uri: process.env.DB2_DATABASE_URL,
  },
  introspect: {
    casing: "preserve",
  },
  out: "./schema",
  verbose: false,
} satisfies Config;
