import { createNodeMiddleware, Probot } from "npm:probot";
import { githubAppMain } from "./github-handle.ts";
import { config } from "./config.ts";

let githubBotEndpoint: ReturnType<typeof createNodeMiddleware>;

if (config.NODE_ENV === "production") {
  const probot = new Probot({
    appId: config.GITHUB_APP_ID,
    privateKey: config.GITHUB_APP_PRIVATE_KEY,
    secret: config.GITHUB_APP_WEBHOOK_SECRET,
  });

  githubBotEndpoint = createNodeMiddleware(githubAppMain, { probot });
} else {
  githubBotEndpoint = () => {};
}

export { githubBotEndpoint };
