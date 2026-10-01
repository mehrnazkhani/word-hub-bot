import { Bot } from "grammy";
import { createStartHandler } from "./features/link-to-app/handler";
import type { Env } from "./types";

export function createBot(env: Env) {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

  bot.command("start", createStartHandler(env));

  return bot;
}
