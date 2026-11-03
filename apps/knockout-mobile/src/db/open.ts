import * as SQLite from "expo-sqlite";

import { migrate } from "./migrations";
import { createExpoRunner } from "./runner";
import type { SqliteRunner } from "./runner";

/**
 * Opens and migrates the device database exactly once per process.
 *
 * WAL is on because the drainer reads the outbox while the UI writes a knock; the
 * default rollback journal would serialise them and show up as a dropped frame.
 */
let opening: Promise<SqliteRunner> | null = null;

export function openDatabase(): Promise<SqliteRunner> {
  opening ??= (async () => {
    const db = await SQLite.openDatabaseAsync("knockout.db");
    await db.execAsync("PRAGMA journal_mode = WAL");
    await db.execAsync("PRAGMA foreign_keys = ON");
    const runner = createExpoRunner(db);
    await migrate(runner);
    return runner;
  })();

  return opening;
}

/** Test seam: forget the open handle. */
export function resetDatabaseForTests(): void {
  opening = null;
}
