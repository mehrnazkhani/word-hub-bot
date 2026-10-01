import { Bot } from "grammy";
import { createStartHandler } from "./features/link-to-app/handler";
import type { Env } from "./types";
import { createWordHandler } from "./features/word/validate/handler";

export function createBot(env: Env) {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

  bot.command("start", createStartHandler(env));
  bot.on("message:text", createWordHandler());

  return bot;
}
