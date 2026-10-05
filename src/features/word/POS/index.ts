import { InlineKeyboard } from "grammy";
import { checkPos } from "../../ai/POS";
import { wordMessages } from "../messages";
import { untrackInlineMessage } from "../keyboards";
import { posMessages } from "./message";
import { PARTS_OF_SPEECH } from "../shared";
import type { PosResult, StepInput } from "../types";

const POS_ALIASES: Record<string, string> = {
  exclamation: "interjection",
  greeting: "interjection",
};

export async function runPosStep({
  conversation,
  ctx,
  env,
  word,
  pendingInline,
}: StepInput): Promise<PosResult> {
  await ctx.replyWithChatAction("typing");

  const result = await conversation.external(async () => {
    try {
      return await checkPos(env, word);
    } catch (err) {
      console.error("[pos] failed:", err);
      return null;
    }
  });

  if (!result) return { ok: false, reason: "error" };

  const options = result.availablePos
    .map((p) => {
      const pos = p.pos.trim().toLowerCase();
      return { ...p, pos: POS_ALIASES[pos] ?? pos };
    })
    .filter((p) => (PARTS_OF_SPEECH as readonly string[]).includes(p.pos));

  if (options.length === 0) return { ok: false, reason: "none" };
  if (options.length === 1) return { ok: true, pos: options[0].pos };

  const keyboard = new InlineKeyboard();
  options.forEach((p, i) => {
    if (i > 0) keyboard.row();
    keyboard.text(p.pos, `ps:${i}`);
  });

  const list = options
    .map((p, i) => `${i + 1}. ${p.pos}: ${p.meaning}`)
    .join("\n");

  const sent = await ctx.reply(`${posMessages.prompt(word)}\n\n${list}`, {
    reply_markup: keyboard,
  });
  pendingInline.push(sent.message_id);

  const choice = await conversation.waitFor("callback_query:data", {
    otherwise: async (c) => {
      // Let the global Cancel handler deal with it — don't nag.
      if (c.msg?.text === wordMessages.cancelButton) return;
      await c.reply(wordMessages.useButtons);
    },
  });
  await choice.answerCallbackQuery();

  const index = Number(choice.callbackQuery.data.replace("ps:", ""));
  const picked = options[index]?.pos ?? options[0].pos;

  try {
    await choice.deleteMessage();
  } catch {
    await choice.editMessageText(`✅ ${word} (${picked})`);
  } finally {
    untrackInlineMessage(pendingInline, sent.message_id);
  }
  return { ok: true, pos: picked };
}
