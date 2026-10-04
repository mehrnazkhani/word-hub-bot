import { Keyboard } from "grammy";
import type { ConversationContext } from "../../context";
import { wordMessages } from "./messages";

export const cancelKeyboard = new Keyboard()
  .text(wordMessages.cancelButton)
  .resized();

export const removeCancelKeyboard = { remove_keyboard: true as const };

export const clearCancelReplayKeyboard = async (ctx: ConversationContext) => {
  try {
    const sent = await ctx.reply("✅", {
      reply_markup: removeCancelKeyboard,
    });
    await ctx.api.deleteMessage(sent.chat.id, sent.message_id);
  } catch (err) {
    console.error("[keyboard] failed to remove cancel keyboard:", err);
  }
};
