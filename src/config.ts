import { load } from "https://deno.land/std@0.198.0/dotenv/mod.ts";

export const config = await load() as {
  NODE_ENV: "production" | "development";
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_APP_WEBHOOK_SECRET: string;
};
