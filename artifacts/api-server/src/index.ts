import app from "./app";
import { logger } from "./lib/logger";

const port = Number(process.env["PORT"] || 3001);

app.listen(port, () => {
  logger.info({ port }, `Server listening on port ${port}`);
});
