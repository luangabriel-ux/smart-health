import { readConfig } from './config/env.js';
import { createPool } from './database/connection/index.js';
import { createApp } from './app.js';
const config = readConfig();
const pool = createPool(config.databaseUrl);
const server = createApp({ pool }).listen(config.port, config.host, () => console.log(`Smart Health API: http://${config.host}:${config.port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  server.close(async () => { await pool.end(); process.exit(0); });
  setTimeout(() => process.exit(1), 10000).unref();
});
