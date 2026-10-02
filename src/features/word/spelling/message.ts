export const spellingMessages = {
  prompt: (word: string) =>
    `🔍 Did you mean one of these instead of “${word}”?`,
  keep: (word: string) => `Keep “${word}”`,
} as const;
