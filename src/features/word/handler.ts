import type { BotContext } from "../../context";
import type { Env } from "../../types";
import { getLinkedUser } from "../user/service";
import { wordMessages } from "./messages";
import { validateWordInput } from "./validate/validate";

export function createWordHandler(env: Env) {
  return async (ctx: BotContext) => {
    const text = ctx.message?.text;
    if (!text || !ctx.from) return;

    const validation = validateWordInput(text);
    if (!validation.ok) {
      await ctx.reply(wordMessages[validation.reason]);
      return;
    }

    // Unlinked users must not reach the AI
    const user = await getLinkedUser(env, ctx.from.id);
    if (!user.ok) {
      await ctx.reply(wordMessages[user.reason]);
      return;
    }

    await ctx.conversation.enter("word", validation.word, user.userId);
  };
}
