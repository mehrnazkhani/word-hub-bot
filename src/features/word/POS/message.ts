export const posMessages = {
  prompt: (word: string) =>
    `🏷️ “${word}” has more than one meaning. Which one?`,
  notAWord:
    "🤔 I couldn't match that to a valid word. Check the spelling and try again.",
} as const;
