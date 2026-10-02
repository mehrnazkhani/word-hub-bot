import { InlineKeyboard } from "grammy";
import { wordMessages } from "./messages";
import { cancelKeyboard, removeCancelKeyboard } from "./keyboards";
import { runSpellingStep } from "./spelling";
import { runBaseFormStep } from "./base-form";
import { runPosStep } from "./POS";
import { runDetailsStep } from "./details";
import { displayWordCard } from "./details/display";
import { posMessages } from "./POS/message";

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

    const pos = await runPosStep({ ...base, word: finalWord });
    if (!pos.ok) {
      if (pos.reason === "none") {
        await ctx.reply(posMessages.notAWord, {
          reply_markup: removeCancelKeyboard,
        });
        return;
      }
      return fail();
    }

    const details = await runDetailsStep({
      ...base,
      word: finalWord,
      pos: pos.pos,
    });
    await ctx.reply(displayWordCard(finalWord, details), {
      parse_mode: "HTML",
      reply_markup: removeCancelKeyboard,
    });
  };
};
