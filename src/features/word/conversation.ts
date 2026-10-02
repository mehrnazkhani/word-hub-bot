import { InlineKeyboard } from "grammy";
import { checkSpelling } from "../ai/spelling";
import { wordMessages } from "./messages";
import { cancelKeyboard, removeCancelKeyboard } from "./keyboards";

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

    await ctx.replyWithChatAction("typing");

    const spelling = await conversation.external(async () => {
      try {
        return await checkSpelling(env, word);
      } catch (err) {
        console.error("[word] spelling failed:", err);
        return null;
      }
    });

    if (!spelling) {
      await ctx.reply(wordMessages.aiError, {
        reply_markup: removeCancelKeyboard,
      });
      return;
    }

    if (spelling.isCorrect || spelling.suggestions.length === 0) {
      await ctx.reply(wordMessages.spellingDone(word), {
        reply_markup: removeCancelKeyboard,
      });
      return;
    }

    const keyboard = new InlineKeyboard();
    spelling.suggestions.forEach((s, i) => keyboard.text(s.word, `sp:${i}`));
    keyboard.row().text(`Keep “${word}”`, "sp:keep");

    const list = spelling.suggestions
      .map((s, i) => `${i + 1}. ${s.word} — ${s.explanation}`)
      .join("\n");

    await ctx.reply(`${wordMessages.spellingPrompt(word)}\n\n${list}`, {
      reply_markup: keyboard,
    });

    const choice = await conversation.waitFor("callback_query:data", {
      otherwise: (c) => c.reply(wordMessages.useButtons),
    });
    await choice.answerCallbackQuery();

    const data = choice.callbackQuery.data;
    const picked =
      data === "sp:keep"
        ? word
        : (spelling.suggestions[Number(data.replace("sp:", ""))]?.word ?? word);

    await choice.editMessageText(`✅ ${picked}`);
    await choice.reply(wordMessages.spellingDone(picked), {
      reply_markup: removeCancelKeyboard,
    });
  };
};
