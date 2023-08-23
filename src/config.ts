import 'dotenv/config'

export const config = process.env as {
  NODE_ENV: "production" | "development";
  GITHUB_APP_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_WEBHOOK_SECRET: string;
  ORG_TOKEN: string;
};
