import app from "./app";
import { logger } from "./lib/logger";
import { runSeed } from "./scripts/seed";

const rawPort = process.env["PORT"] || "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function startServer() {
  if (process.env.SEED_ON_START === "true") {
    try {
      await runSeed(false);
    } catch (err) {
      logger.error({ err }, "Initial seed failed");
    }
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}

startServer().catch((err: unknown) => {
  logger.error({ err }, "Server startup failed");
  process.exit(1);
});
