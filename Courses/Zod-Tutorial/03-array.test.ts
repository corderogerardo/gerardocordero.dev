// CODE

import { expect, it } from "vitest";

import { fetchStarWarsPeople } from "./03-array.problem";

it("Should return the name", async () => {
  expect((await fetchStarWarsPeople())[0]).toEqual({
    name: "Luke Skywalker",
  });
});
