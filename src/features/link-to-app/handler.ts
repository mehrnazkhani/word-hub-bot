import type { CommandContext, Context } from "grammy";
import { messages } from "./messages";
import type { Env } from "../../types";
import { linkTelegramAccount } from "./service";

export function createStartHandler(env: Env) {
  return async (ctx: CommandContext<Context>) => {
    if (!ctx.from || !ctx.chat) return;

    const token = ctx.match.trim();

    if (!token) {
      await ctx.reply(messages.link.noToken);
      return;
    }

    const result = await linkTelegramAccount(env, {
      token,
      telegramUserId: ctx.from.id,
      chatId: ctx.chat.id,
    });

    await ctx.reply(messages.link[result]);
  };
}
