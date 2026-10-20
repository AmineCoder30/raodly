import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

const databasePromise = SQLite.openDatabaseAsync("roadly.db");
const initializedDatabasePromise = databasePromise.then(async (db) => {
  await db.execAsync("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  await runMigrations(db);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS lessons (
      topic_id TEXT NOT NULL,
      language TEXT NOT NULL,
      content_version TEXT NOT NULL,
      lesson_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (topic_id, language, content_version)
    );
  `);
  return db;
});

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return initializedDatabasePromise;
}
