import { createNodeMiddleware, Probot } from "probot";
import { githubAppMain } from "./github-handle.js";
import { config } from "./config.js";

let githubBotEndpoint: ReturnType<typeof createNodeMiddleware>;

 
if (config.NODE_ENV === "production") {
 
  const probot = new Probot({
    appId: config.GITHUB_APP_ID,
    privateKey: Buffer.from(config.GITHUB_APP_PK_BASE64, "base64").toString("utf-8"),
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
