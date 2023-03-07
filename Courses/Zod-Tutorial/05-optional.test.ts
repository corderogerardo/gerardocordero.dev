// CODE

import { expect, it } from "vitest";

import { validateFormInput } from "./05-optional.problem";

it("Should validate correct inputs", async () => {
  expect(() =>
    validateFormInput({
      name: "Matt",
    })
  ).not.toThrow();

  expect(() =>
    validateFormInput({
      name: "Matt",
      phoneNumber: "123",
    })
  ).not.toThrow();
});

it("Should throw when you do not include the name", async () => {
  expect(() => validateFormInput({})).toThrowError("Required");
});
