import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect:'postgresql',
  schema: "./src/config/drizzle/schemas/*",
  out: "./src/config/drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,});

