export function readConfig(env = process.env) {
  if (!env.DATABASE_URL) throw new Error('Configure DATABASE_URL.');
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválida.');
  return { databaseUrl: env.DATABASE_URL, host: env.HOST ?? '127.0.0.1', port };
}
