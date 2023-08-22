import express from "npm:express";
import { githubBotEndpoint } from "./probot.ts";

export const startServer = async () => {
  const app  = express();
 

  app.use("/github-webhook", githubBotEndpoint);
  app.get("/", (_req: any, res: { send: (arg0: string) => void; }) => {
    res.send("Hello World!");
    });

  try {
    await app.listen(4440);
  } catch (err) {
    app.log.error(err);
    Deno.exit(1);
  }
};
