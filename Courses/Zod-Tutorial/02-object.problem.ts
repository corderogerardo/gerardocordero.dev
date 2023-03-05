import { fetch } from "cross-fetch";

import { z } from "zod";

const PersonResult = z.object({
  name: z.string(),
  eye_color: z.string(),
});

export const fetchStarWarsPersonName = async (id: string) => {
  const data = await fetch(
    "https://www.totaltypescript.com/swapi/people/" + id + ".json"
  ).then((res) => res.json());

  console.log("data", data);

  const parsedData = PersonResult.parse(data);
  console.log("parsedData", parsedData);

  return parsedData.name;
};
