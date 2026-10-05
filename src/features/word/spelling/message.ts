import { escapeHtml } from "../shared";

export const spellingMessages = {
  prompt: (word: string) =>
    `<b>• Spell check</b>\n\n“${escapeHtml(word)}” might be a typo. Choose one:`,
  keep: (word: string) => `Keep “${word}”`,
} as const;
