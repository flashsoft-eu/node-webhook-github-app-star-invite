import fastify from "npm:fastify";
import expressMiddleware from "npm:@fastify/express";
import { githubBotEndpoint } from "./probot.ts";

export const startServer = async () => {
  const server = fastify();
  server.register(expressMiddleware);

  server.use("/github-webhook", githubBotEndpoint);

  try {
    await server.listen(4440);
  } catch (err) {
    server.log.error(err);
    Deno.exit(1);
  }
};
