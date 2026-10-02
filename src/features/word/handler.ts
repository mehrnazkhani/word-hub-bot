import type { BotContext } from "../../context";
import { wordMessages } from "./messages";
import { validateWordInput } from "./validate/validate";

export function createWordHandler() {
  return async (ctx: BotContext) => {
    const text = ctx.message?.text;
    if (!text) return;

    const validation = validateWordInput(text);
    if (!validation.ok) {
      await ctx.reply(wordMessages[validation.reason]);
      return;
    }

    await ctx.conversation.enter("word", validation.word);
  };
}
