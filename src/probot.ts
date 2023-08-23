import { createNodeMiddleware, Probot } from "probot";
import { githubAppMain } from "./github-handle";
import { config } from "./config";

let githubBotEndpoint: ReturnType<typeof createNodeMiddleware>;

 
if (config.NODE_ENV === "production") {
  const probot = new Probot({
    appId: config.GITHUB_APP_ID,
    privateKey: config.GITHUB_APP_PRIVATE_KEY,
    logLevel: "debug",
    secret: config.GITHUB_WEBHOOK_SECRET,
  });

  githubBotEndpoint = createNodeMiddleware(githubAppMain, { probot });
} else {
  githubBotEndpoint = ((_req: unknown, _res: {send: (a: unknown) => void}) => {
    _res.send({
      message: "This is a development server. No GitHub App is running here.",
    });
  }) as any;
}

export { githubBotEndpoint };
