import type * as SQLite from "expo-sqlite";
import { migrateLearningSchema } from "./001_learning_schema";
import { migrateSectionsAndLessons } from "./002_sections_and_lessons";

const LATEST_SCHEMA_VERSION = 2;

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const versionRow = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion < 1) {
    await db.withTransactionAsync(async () => {
      await migrateLearningSchema(db);
      await db.execAsync(`PRAGMA user_version = ${LATEST_SCHEMA_VERSION}`);
    });
  }

  if (currentVersion < 2) {
    await db.withTransactionAsync(async () => {
      await migrateSectionsAndLessons(db);
      await db.execAsync("PRAGMA user_version = 2");
    });
  }
}
