// CODE

import { z } from "zod";

const Form = z.object({
  repoName: z.string(),
  keywords: z.array(z.string()).default([]),
  //                           ^ 🕵️‍♂️
});

type FormInput = z.input<typeof Form>;
type FormOutput = z.infer<typeof Form>;

export const validateFormInput = (values: unknown) => {
  const parsedData = Form.parse(values);

  return parsedData;
};
