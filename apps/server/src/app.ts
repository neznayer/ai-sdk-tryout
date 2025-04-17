import { Hono } from "hono";

import { generateText, streamText, type CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import { cors } from "hono/cors";
import { stream } from "hono/streaming";

const gemini = google("gemini-1.5-flash");

const app = new Hono();

app.use("/api/*", cors());

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

app.post("/api/chat", async (ctx) => {
  const messages: CoreMessage[] = await ctx.req.json();

  const res = await generateText({
    model: gemini,
    messages,
  });

  return ctx.json(res.response.messages);
});

app.post("/api/streaming-prompt", async (ctx) => {
  const textMessage = await ctx.req.text();

  const res = streamText({
    model: gemini,
    messages: [
      {
        content: textMessage,
        role: "user",
      },
    ],
  });

  return stream(ctx, (stream) => stream.pipe(res.toDataStream()));
});

export default app;
