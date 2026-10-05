import { wordMessages } from "./messages";
import { cancelKeyboard, removeCancelKeyboard } from "./keyboards";
import { runSpellingStep } from "./spelling";
import { runBaseFormStep } from "./base-form";
import { runPosStep } from "./POS";
import { runDetailsStep } from "./details";
import { runSaveStep } from "./save";
import { displayWordCard } from "./details/display";
import { posMessages } from "./POS/message";

import type { Env } from "../../types";
import type { BotConversation, ConversationContext } from "../../context";

export const createWordConversation = (env: Env) => {
  return async function wordConversation(
    conversation: BotConversation,
    ctx: ConversationContext,
    word: string,
    userId: string,
  ) {
    // Messages with live inline buttons (option prompts).
    // If the user cancels, these must disappear — dead buttons confuse.
    const pendingInline: number[] = [];
    // Word card messages to keep on cancel — only their buttons are stripped.
    const keepInline: number[] = [];

    // Global cancel: stays active at every wait call below.
    conversation.waitForHears(wordMessages.cancelButton).then(async (c) => {
      const chatId = c.chat?.id;
      if (chatId !== undefined) {
        for (const id of [...pendingInline]) {
          try {
            await c.api.deleteMessage(chatId, id);
          } catch {
            // Already gone (e.g. deleted after a choice) — ignore.
          }
        }
        for (const id of [...keepInline]) {
          try {
            await c.api.editMessageReplyMarkup(chatId, id);
          } catch {
            // Already edited or gone — ignore.
          }
        }
      }
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

    const base = { conversation, ctx, env, pendingInline };

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
    if (!details) return fail();

    // The user's chosen part of speech wins over what the AI returned
    const finalDetails = { ...details, partOfSpeech: pos.pos };

    await runSaveStep({
      ...base,
      word: finalWord,
      pos: pos.pos,
      userId,
      details: finalDetails,
      cardHtml: displayWordCard(finalWord, finalDetails),
      keepInline,
    });
  };
};
