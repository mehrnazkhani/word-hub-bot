import { Bot } from "grammy";
import {
  conversations,
  createConversation,
  type ConversationData,
  type VersionedState,
} from "@grammyjs/conversations";
import type { BotContext } from "./context";
import { createStartHandler } from "./features/link-to-app/handler";
import { createWordConversation } from "./features/word/conversation";
import { createWordHandler } from "./features/word/handler";
import { createKvStorage } from "./lib/kv-storage";
import type { Env } from "./types";

export function createBot(env: Env) {
  const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN);

  bot.use(
    conversations({
      storage: {
        type: "key",
        version: 1,
        prefix: "convo:",
        adapter: createKvStorage<VersionedState<ConversationData>>(
          env.CONVERSATIONS,
        ),
      },
    }),
  );

  bot.use(createConversation(createWordConversation(env), "word"));

  bot.command("start", createStartHandler(env));
  bot.on("message:text", createWordHandler()); // must stay last

  return bot;
}
