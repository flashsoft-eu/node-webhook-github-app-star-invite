import { startServer } from "./src/server.ts";

if (import.meta.main) {
  await startServer();
}
