import "dotenv/config";
import { createApp } from "./app";
import { config } from "./config";
import { logger } from "./utils/logger";

const app = createApp();

app.listen(config.port, () => {
  logger.info(`ITSM Backend running on port ${config.port} [${config.nodeEnv}]`);
  logger.info(`Health check: http://localhost:${config.port}/api/v1/health`);
});
