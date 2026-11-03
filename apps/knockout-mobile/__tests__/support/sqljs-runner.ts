import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import initSqlJs from "sql.js";
import type { BindParams, Database, SqlJsStatic } from "sql.js";

import type { SqlParameter, SqliteRunner } from "../../src/db/runner";

/**
 * A real SQLite engine for tests, via sql.js (SQLite compiled to WebAssembly).
 *
 * Why not a fake: the write path's whole guarantee is transactional. A hand-written
 * fake would happily "roll back" because the test told it to. This one is the actual
 * engine, running the actual migrations, in memory, in about a millisecond.
 */
let engine: SqlJsStatic | null = null;

async function getEngine(): Promise<SqlJsStatic> {
  if (engine) return engine;
  const requireFromHere = createRequire(__filename);
  const packageDir = path.dirname(requireFromHere.resolve("sql.js"));
  const wasmBinary = fs.readFileSync(path.join(packageDir, "sql-wasm.wasm"));
  // `wasmBinary` is supported at runtime but missing from the published types.
  engine = await initSqlJs({ wasmBinary } as unknown as Parameters<typeof initSqlJs>[0]);
  return engine;
}

export type TestRunner = SqliteRunner & { close(): void; raw(): Database };

export async function createTestRunner(): Promise<TestRunner> {
  const SQL = await getEngine();
  const db = new SQL.Database();
  let depth = 0;

  const runner: SqliteRunner = {
    async run(sql, params: readonly SqlParameter[] = []) {
      db.run(sql, params as unknown as BindParams);
    },

    async all<T>(sql: string, params: readonly SqlParameter[] = []) {
      const statement = db.prepare(sql);
      try {
        statement.bind(params as unknown as BindParams);
        const rows: T[] = [];
        while (statement.step()) rows.push(statement.getAsObject() as T);
        return rows;
      } finally {
        statement.free();
      }
    },

    async first<T>(sql: string, params: readonly SqlParameter[] = []) {
      const rows = await runner.all<T>(sql, params);
      return rows[0] ?? null;
    },

    async transaction<T>(fn: (tx: SqliteRunner) => Promise<T>) {
      // Nested calls reuse the outer transaction; SQLite has no nested BEGIN.
      if (depth > 0) return fn(runner);
      depth += 1;
      db.run("BEGIN");
      try {
        const result = await fn(runner);
        db.run("COMMIT");
        return result;
      } catch (error) {
        db.run("ROLLBACK");
        throw error;
      } finally {
        depth -= 1;
      }
    },
  };

  return Object.assign(runner, {
    close: () => db.close(),
    raw: () => db,
  });
}
