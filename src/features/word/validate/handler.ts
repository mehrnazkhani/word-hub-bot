import type { Context } from "grammy";
import { validateMessages } from "./messages";
import { validateWordInput } from "./validate";

export const createWordHandler = () => {
  return async (ctx: Context) => {
    const text = ctx.message?.text;
    if (!text) return;

    const result = validateWordInput(text);

    if (!result.ok) {
      await ctx.reply(validateMessages[result.reason]);
      return;
    }

    await ctx.reply(`🔎 Got it: ${result.word}`);
  };
};
