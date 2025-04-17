import { tool } from "ai";
import z from "zod";

const myTool = tool({
  description: "my tool for ",
  parameters: z.object({
    country: z
      .string()
      .min(1)
      .max(100)
      .default("USA")
      .describe("Country to search by"),
  }),
  execute: async ({ country }) => {
    if (!country) {
      return [];
    }

    const file = Bun.file("./data.json");

    const json = await file.json();

    const result = [];
    if (country) {
      result.push(...json.filter((item) => item.country === country));
    }

    return result;
  },
});

export default myTool;
