import type * as SQLite from "expo-sqlite";
import { migrateInitialSchema } from "./001_initial_schema";

/**
 * Drops every legacy table from previous iterations,
 * ensuring the database converges on the clean 5-table schema.
 */
const LEGACY_TABLES = [
 


  "lessons",
  
  "lesson_messages",
  "lesson",
  "topic_lessons",
  "roadmap_topics",
  "roadmaps",
];

async function dropLegacyTables(db: SQLite.SQLiteDatabase): Promise<void> {
  for (const table of LEGACY_TABLES) {
    await db.execAsync(`DROP TABLE IF EXISTS "${table}";`);
  }
}

/** Version that marks the new 5-table schema epoch. */
export const LATEST_SCHEMA_VERSION = 100;

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const versionRow = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= LATEST_SCHEMA_VERSION) return;

  await db.withTransactionAsync(async () => {
    if (currentVersion > 0 && currentVersion < LATEST_SCHEMA_VERSION) {
      await dropLegacyTables(db);
    }

    await migrateInitialSchema(db);
    await db.execAsync(`PRAGMA user_version = ${LATEST_SCHEMA_VERSION}`);
  });
}
