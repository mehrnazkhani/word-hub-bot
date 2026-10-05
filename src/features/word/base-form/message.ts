import { escapeHtml } from "../shared";

export const baseFormMessages = {
  prompt: (word: string, base: string, description: string) =>
    `<b>• Base form</b>\n\n“${escapeHtml(word)}” is the ${escapeHtml(description || "different form")} of “${escapeHtml(base)}”.\n\nChoose one:`,
  use: (base: string) => `Use “${base}”`,
  keep: (word: string) => `Keep “${word}”`,
} as const;
