import { InlineKeyboard } from "grammy";
import { checkBaseForm } from "../../ai/base-form";
import { wordMessages } from "../messages";
import { baseFormMessages } from "./message";
import type { StepInput, StepResult } from "../types";

export async function runBaseFormStep({
  conversation,
  ctx,
  env,
  word,
}: StepInput): StepResult {
  await ctx.replyWithChatAction("typing");

  const result = await conversation.external(async () => {
    try {
      return await checkBaseForm(env, word);
    } catch (err) {
      console.error("[base-form] failed:", err);
      return null;
    }
  });

  if (!result) return null;

  const base = result.baseForm.trim();
  const hasDifferentBase =
    !result.isBaseForm && base && base.toLowerCase() !== word.toLowerCase();

  if (!hasDifferentBase) return word;

  const keyboard = new InlineKeyboard()
    .text(baseFormMessages.use(base), "bf:base")
    .text(baseFormMessages.keep(word), "bf:keep");

  await ctx.reply(baseFormMessages.prompt(word, base, result.formDescription), {
    reply_markup: keyboard,
  });

  const choice = await conversation.waitFor("callback_query:data", {
    otherwise: (c) => c.reply(wordMessages.useButtons),
  });
  await choice.answerCallbackQuery();

  const picked = choice.callbackQuery.data === "bf:base" ? base : word;
  await choice.editMessageText(`✅ ${picked}`);
  return picked;
}
