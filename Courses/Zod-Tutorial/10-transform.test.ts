// CODE

import { expect, it } from "vitest";
import { fetchStarWarsPeople } from "./10-transform.problem";
// TESTS

it("Should resolve the name and nameAsArray", async () => {
  expect((await fetchStarWarsPeople())[0]).toEqual({
    name: "Luke Skywalker",
    nameAsArray: ["Luke", "Skywalker"],
  });
});
