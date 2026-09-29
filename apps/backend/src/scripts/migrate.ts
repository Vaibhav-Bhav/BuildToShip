import fs from "fs/promises";
import path from "path";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const migrationsDir = path.resolve(__dirname, "../../../../supabase/migrations");
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();

    const { rows: executedRows } = await client.query("SELECT name FROM _migrations");
    const executedSet = new Set(executedRows.map((r: { name: string }) => r.name));

    for (const sqlFile of sqlFiles) {
      if (executedSet.has(sqlFile)) {
        logger.info({ migration: sqlFile }, "Migration already applied, skipping");
        continue;
      }

      logger.info({ migration: sqlFile }, "Applying migration");
      const filePath = path.join(migrationsDir, sqlFile);
      const sqlContent = await fs.readFile(filePath, "utf-8");

      await client.query("BEGIN");
      try {
        await client.query(sqlContent);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [sqlFile]);
        await client.query("COMMIT");
        logger.info({ migration: sqlFile }, "Migration applied successfully");
      } catch (err) {
        await client.query("ROLLBACK");
        logger.error({ migration: sqlFile, err }, "Migration failed, transaction rolled back");
        throw err;
      }
    }

    logger.info("All migrations completed successfully.");
  } finally {
    client.release();
  }
}

if (process.argv[1]?.includes("migrate")) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("Migration runner failed:", err);
      await pool.end();
      process.exit(1);
    });
}
