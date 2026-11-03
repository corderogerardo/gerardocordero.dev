import type { SQLiteDatabase } from "expo-sqlite";

/**
 * The smallest database interface the app needs.
 *
 * It exists so the persistence layer can be executed for real in tests (with
 * `sql.js`) instead of being asserted against a hand-written fake that proves only
 * that the fake agrees with itself. On device, `createExpoRunner` is the adapter.
 */
export type SqlParameter = string | number | null;

export type SqliteRunner = {
  run(sql: string, params?: readonly SqlParameter[]): Promise<void>;
  all<T>(sql: string, params?: readonly SqlParameter[]): Promise<T[]>;
  first<T>(sql: string, params?: readonly SqlParameter[]): Promise<T | null>;
  /**
   * Runs `fn` inside a transaction. Everything inside must go through the runner it
   * receives, or it will land outside the transaction and defeat the purpose.
   */
  transaction<T>(fn: (tx: SqliteRunner) => Promise<T>): Promise<T>;
};

/**
 * Adapts expo-sqlite. `withTransactionAsync` is used rather than the exclusive
 * variant because the sync drainer may read while the user writes; WAL mode (set in
 * `openDatabase`) is what makes that safe.
 */
export function createExpoRunner(db: SQLiteDatabase): SqliteRunner {
  const runner: SqliteRunner = {
    async run(sql, params = []) {
      await db.runAsync(sql, params as SqlParameter[]);
    },
    async all<T>(sql: string, params: readonly SqlParameter[] = []) {
      return (await db.getAllAsync(sql, params as SqlParameter[])) as T[];
    },
    async first<T>(sql: string, params: readonly SqlParameter[] = []) {
      return (await db.getFirstAsync(sql, params as SqlParameter[])) as T | null;
    },
    async transaction<T>(fn: (tx: SqliteRunner) => Promise<T>) {
      let result: T | undefined;
      await db.withTransactionAsync(async () => {
        result = await fn(runner);
      });
      return result as T;
    },
  };
  return runner;
}
