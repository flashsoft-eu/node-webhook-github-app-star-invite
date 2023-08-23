import express from "express";
import { githubBotEndpoint } from "./probot";
import morgan from "morgan";


export const startServer = async () => {
  const app  = express();
  app.use(morgan("dev"));
  app.use("/github-webhook", githubBotEndpoint);
  app.get("/", (_req: any, res: { send: (arg0: string) => void; }) => {
    res.send("Hello World!");
    });

  try {
    await app.listen(4440);
    console.log("Server listening on port 4440");
  } catch (err) {
    console.error(err);
  }
};
