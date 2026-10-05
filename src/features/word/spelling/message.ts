export const spellingMessages = {
  prompt: (word: string) => `“${word}” might be a typo. Choose one:`,
  keep: (word: string) => `Keep “${word}”`,
} as const;
