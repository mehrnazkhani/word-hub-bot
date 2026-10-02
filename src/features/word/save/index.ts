import { InlineKeyboard } from "grammy";
import { removeCancelKeyboard } from "../keyboards";
import { wordMessages } from "../messages";
import { saveMessages } from "./message";
import { saveWord } from "./service";
import type { SaveStepInput } from "../types";

const MAX_ATTEMPTS = 3;

export const runSaveStep = async ({
  conversation,
  ctx,
  env,
  word,
  pos,
  details,
  userId,
  cardHtml,
}: SaveStepInput): Promise<void> => {
  const keyboard = new InlineKeyboard().text(
    saveMessages.saveButton,
    "sv:save",
  );
  await ctx.reply(cardHtml, { parse_mode: "HTML", reply_markup: keyboard });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const click = await conversation.waitForCallbackQuery("sv:save", {
      otherwise: (c) => c.reply(wordMessages.useButtons),
    });

    // Golden rule: DB writes must be wrapped in conversation.external
    const result = await conversation.external(() =>
      saveWord(env, { userId, word, pos, details }),
    );

    if (result.status === "error" && attempt < MAX_ATTEMPTS) {
      // Popup instead of editing the message: the button stays for a retry
      await click.answerCallbackQuery({
        text: saveMessages.retry,
        show_alert: true,
      });
      continue;
    }

    await click.answerCallbackQuery();

    const text =
      result.status === "success"
        ? saveMessages.success
        : result.status === "limit_reached"
          ? saveMessages.limitReached
          : saveMessages.failed;

    // No reply_markup here, so the Save button is removed
    await click.editMessageText(`${cardHtml}\n\n${text}`, {
      parse_mode: "HTML",
    });
    break;
  }

  // A message can only carry one reply_markup, so removing the Cancel
  // keyboard needs its own message.
  await ctx.reply(saveMessages.next, { reply_markup: removeCancelKeyboard });
};
