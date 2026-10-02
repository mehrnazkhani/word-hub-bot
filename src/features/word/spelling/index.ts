import { InlineKeyboard } from "grammy";
import { checkSpelling } from "../../ai/spelling";
import { wordMessages } from "../messages";
import { spellingMessages } from "./message";
import type { StepInput, StepResult } from "../types";

export async function runSpellingStep({
  conversation,
  ctx,
  env,
  word,
}: StepInput): StepResult {
  await ctx.replyWithChatAction("typing");

  // Golden rule: network calls must be wrapped in conversation.external
  const result = await conversation.external(async () => {
    try {
      return await checkSpelling(env, word);
    } catch (err) {
      console.error("[spelling] failed:", err);
      return null;
    }
  });

  if (!result) return null;
  if (result.isCorrect || result.suggestions.length === 0) return word;

  const keyboard = new InlineKeyboard();
  result.suggestions.forEach((s, i) => keyboard.text(s.word, `sp:${i}`));
  keyboard.row().text(spellingMessages.keep(word), "sp:keep");

  const list = result.suggestions
    .map((s, i) => `${i + 1}. ${s.word} — ${s.explanation}`)
    .join("\n");

  await ctx.reply(`${spellingMessages.prompt(word)}\n\n${list}`, {
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
      : (result.suggestions[Number(data.replace("sp:", ""))]?.word ?? word);

  await choice.editMessageText(`✅ ${picked}`);
  return picked;
}
