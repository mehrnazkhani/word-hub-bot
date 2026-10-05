import { escapeHtml } from "../shared";

export const posMessages = {
  prompt: (word: string) =>
    `<b>• Part of speech</b>\n\n“${escapeHtml(word)}” has multiple meanings. Choose one:`,
  notAWord:
    "🤔 I couldn't match that to a valid word. Check the spelling and try again.",
} as const;
