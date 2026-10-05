import { InlineKeyboard } from "grammy";
import { clearCancelReplayKeyboard } from "../keyboards";
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
  keepInline,
}: SaveStepInput): Promise<void> => {
  const keyboard = new InlineKeyboard().text(
    saveMessages.saveButton,
    "sv:save",
  );
  const card = await ctx.reply(cardHtml, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
  // Keep the word card visible if the user cancels — only strip its button.
  keepInline.push(card.message_id);

  try {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const click = await conversation.waitForCallbackQuery("sv:save", {
        otherwise: async (c) => {
          // Let the global Cancel handler deal with it — don't nag.
          if (c.msg?.text === wordMessages.cancelButton) return;
          await c.reply(wordMessages.useButtons);
        },
      });

      // Golden rule: DB writes must be wrapped in conversation.external
      const result = await conversation.external(() =>
        saveWord(env, { userId, word, pos, details }),
      );

      if (result.status === "error" && attempt < MAX_ATTEMPTS) {
        // Popup instead of editing the message: the button stays for a retry
        await click.answerCallbackQuery({
          text: saveMessages.retry,
        });
        continue;
      }

      const text = {
        success: saveMessages.success,
        duplicate: saveMessages.duplicate,
        limit_reached: saveMessages.limitReached,
        error: saveMessages.failed,
      }[result.status];

      await click.editMessageText(`${cardHtml}\n\n${text}`, {
        parse_mode: "HTML",
      });

      await click.answerCallbackQuery({ text });
      break;
    }
  } finally {
    // Conversation is over — hide the Cancel reply keyboard.
    await clearCancelReplayKeyboard(ctx);
  }
};
