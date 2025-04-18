import { Hono } from "hono";

import {
  experimental_generateImage,
  generateObject,
  generateText,
  streamText,
  type CoreMessage,
} from "ai";
import { google } from "@ai-sdk/google";
import { cors } from "hono/cors";
import { stream } from "hono/streaming";
import myTool from "./tool";
import { z } from "zod";

const gemini = google("gemini-1.5-flash");

const app = new Hono();

app.use("/api/*", cors());

app.post("/api/prompt", async (ctx) => {
  const textMessage = await ctx.req.text();

  const res = await generateText({
    model: gemini,
    prompt: textMessage,
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

app.post("/api/tool-prompt", async (ctx) => {
  const textMessage = await ctx.req.text();

  const res = await generateText({
    model: gemini,
    messages: [
      {
        content: textMessage,
        role: "user",
      },
    ],
    tools: {
      myTool: myTool,
    },
    maxSteps: 5,
  });

  return ctx.text(res.text);
});

app.post("/api/recipe", async (ctx) => {
  const prompt = await ctx.req.text();

  const res = await generateObject({
    model: gemini,
    prompt,
    schema: z.object({
      name: z.string().describe("Name for the recipe"),
      ingridients: z.array(
        z.object({
          name: z.string(),
          quantity: z.string(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  });

  return ctx.json(res.object);
});

app.post("/api/image", async (ctx) => {
  const prompt = await ctx.req.text();

  const result = await generateText({
    model: google("gemini-2.0-flash-exp"),
    providerOptions: {
      google: { responseModalities: ["TEXT", "IMAGE"] },
    },
    prompt,
  });

  return ctx.json(result.files[0]);
});

export default app;
