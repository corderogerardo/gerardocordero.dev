/**
 * It's important to understand the terminology around unions:
 *
 * One of the type declarations below is a union.
 * One of the type declarations below is a discriminated union.
 * One of the type declarations below is an enum.
 *
 * Which is which?
 */

// is a discriminated union.
type A =
  | {
      type: "a";
      a: string;
    }
  | {
      type: "b";
      b: string;
    }
  | {
      type: "c";
      c: string;
    };

// is a union.
type B = "a" | "b" | "c";

// is an enum.
enum C {
  A = "a",
  B = "b",
  C = "c",
}

export {};
