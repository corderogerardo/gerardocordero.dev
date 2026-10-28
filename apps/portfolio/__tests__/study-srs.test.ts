// The shared SRS + streak scheduler suite now lives beside its module in
// prep-kit (packages/prep-kit/src/lib/study-srs.test.ts). This file re-exports
// it so the portfolio test run keeps coverage without duplicating the suite.
export * from "@gerardocordero/prep-kit/lib/study-srs.test";
