import { migrateSectionsAndLessons } from "./002_sections_and_lessons";

describe("sections and lessons migration", () => {
  it("creates hierarchy tables and rebuilds topic foreign keys", async () => {
    const statements: string[] = [];
    const db = {
      getAllAsync: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]),
      execAsync: jest.fn(async (sql: string) => {
        statements.push(sql);
      }),
      runAsync: jest.fn(),
    };

    await migrateSectionsAndLessons(db as never);

    const sql = statements.join("\n");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS roadmap_sections");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS topic_lessons");
    expect(sql).toContain(
      "section_id TEXT NOT NULL REFERENCES roadmap_sections(id)",
    );
    expect(sql).toContain(
      "topic_id TEXT NOT NULL REFERENCES roadmap_topics(id)",
    );
    expect(sql).toContain("CREATE INDEX idx_roadmap_topics_section_order");
  });
});
