import { Hono } from "hono";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const gemini = google("gemini-1.5-flash");

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/prompt", async (ctx) => {
  const textMessage = await ctx.req.text();

  const res = await generateText({
    model: gemini,
    messages: [
      {
        content: textMessage,
        role: "user",
      },
    ],
  });

  return ctx.text(res.text);
});

export default app;
