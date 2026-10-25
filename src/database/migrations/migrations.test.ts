import { migrateInitialSchema } from "./001_initial_schema";

describe("initial schema migration", () => {
  it("creates all 5 tables and indexes for the new schema", async () => {
    const statements: string[] = [];
    const db = {
      execAsync: jest.fn(async (sql: string) => {
        statements.push(sql);
      }),
    };

    await migrateInitialSchema(db as never);

    const sql = statements.join("\n");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS roadmaps");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS roadmap_topics");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS topic_lessons");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS lesson");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS lesson_messages");

    expect(sql).toContain("roadmap_id INTEGER NOT NULL REFERENCES roadmaps(id)");
    expect(sql).toContain("topic_id INTEGER NOT NULL REFERENCES roadmap_topics(id)");
    expect(sql).toContain(
      "topic_lesson_id INTEGER NOT NULL UNIQUE REFERENCES topic_lessons(id)",
    );
    expect(sql).toContain("lesson_id INTEGER NOT NULL REFERENCES lesson(id)");

    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_topics_roadmap");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_lessons_topic");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_messages_lesson");
  });
});
