import { InlineKeyboard } from "grammy";
import { wordMessages } from "./messages";
import { cancelKeyboard, removeCancelKeyboard } from "./keyboards";
import { runSpellingStep } from "./spelling";
import { runBaseFormStep } from "./base-form";

import type { Env } from "../../types";
import type { BotConversation, ConversationContext } from "../../context";

export const createWordConversation = (env: Env) => {
  return async function wordConversation(
    conversation: BotConversation,
    ctx: ConversationContext,
    word: string,
  ) {
    conversation.waitForHears(wordMessages.cancelButton).then(async (c) => {
      await c.reply(wordMessages.cancelled, {
        reply_markup: removeCancelKeyboard,
      });
      await conversation.halt();
    });

    await ctx.reply(wordMessages.searching(word), {
      reply_markup: cancelKeyboard,
    });

    const fail = () =>
      ctx.reply(wordMessages.aiError, { reply_markup: removeCancelKeyboard });

    const base = { conversation, ctx, env };

    const spelled = await runSpellingStep({ ...base, word });
    if (!spelled) return fail();

    const finalWord = await runBaseFormStep({ ...base, word: spelled });
    if (!finalWord) return fail();

    await ctx.reply(wordMessages.confirmed(finalWord), {
      reply_markup: removeCancelKeyboard,
    });
  };
};
