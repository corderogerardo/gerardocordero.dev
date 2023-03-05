import { expect, it } from "vitest";
import { fetch } from "cross-fetch";

import { fetchStarWarsPersonName } from "./02-object.problem";

it("Should return the name", async () => {
  expect(await fetchStarWarsPersonName("1")).toEqual("Luke Skywalker");
  expect(await fetchStarWarsPersonName("2")).toEqual("C-3PO");
});
