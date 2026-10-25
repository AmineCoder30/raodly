import { getDatabase } from "./index";

type TableRow = { name: string };

export async function listTables(): Promise<string[]> {
  const db = await getDatabase();
  console.log("Database instance:", db); // Log the database instance to verify it's not null
  const tables = await db.getAllAsync<TableRow>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );

  return tables.map(({ name }) => name);
}

export async function getTableItems<T extends Record<string, unknown>>(
  tableName: string,
): Promise<T[]> {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(tableName)) {
    throw new Error(`Invalid table name: ${tableName}`);
  }

  const db = await getDatabase();
  return db.getAllAsync<T>(`SELECT * FROM "${tableName}"`);
}
