import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

const LOCK_RETRY_DELAYS_MS = [100, 250, 500, 1_000, 2_000, 3_000];

//check if the error is a database lock error
function isDatabaseLocked(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("database is locked") || message.includes("SQLITE_BUSY")
  );
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
// Retry a function if it fails due to a database lock error, with increasing delays between attempts
async function withLockRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      const retryDelay = LOCK_RETRY_DELAYS_MS[attempt];
      if (!isDatabaseLocked(error) || retryDelay === undefined) throw error;
      await delay(retryDelay);
    }
  }
}

async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync("roadly.db");

  // Set the busy timeout to 5 seconds
  await db.execAsync("PRAGMA busy_timeout = 5000;");

  await db.execAsync("PRAGMA foreign_keys = ON;");

  await withLockRetry(() => runMigrations(db));

  return db;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
// Get the database instance, initializing it if necessary
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = initializeDatabase().catch((error) => {
      dbPromise = null; 
      throw error;
    });
  }
  return dbPromise;
}
