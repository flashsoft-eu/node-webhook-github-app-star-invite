import express from "express";
import { githubBotEndpoint } from "./probot";
import { githubOauthLogin, githubOauthCallback } from "./github-handle";
import morgan from "morgan";


export const startServer = async () => {
  const app  = express();
  app.use(morgan("dev"));
  app.use("/github-webhook", githubBotEndpoint);
  app.get("/github-oauth-login", githubOauthLogin);
  app.get("/github-oauth-callback", githubOauthCallback);
  app.get("/", (_req: any, res: { send: (arg0: string) => void; }) => {
    res.send("Github bot is running!");
  });

  try {
    await app.listen(4440, '0.0.0.0');
    console.log("Server listening on port 4440");
  } catch (err) {
    console.error(err);
  }
};
