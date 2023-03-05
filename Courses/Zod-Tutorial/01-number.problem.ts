import { z } from "zod";

const parseNumber = z.number();

export const toString = (num: unknown) => {
  const parsed = parseNumber.parse(num);
  return String(parsed);
};
