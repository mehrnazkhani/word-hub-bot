import { Hono } from "hono";
import { webhookCallback } from "grammy";
import { createBot } from "./bot";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

app.post("/webhook", async (c) => {
  const bot = createBot(c.env);
  return webhookCallback(bot, "hono")(c);
});

export default app;
