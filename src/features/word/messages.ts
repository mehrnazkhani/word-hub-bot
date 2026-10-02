export const wordMessages = {
  empty: "✏️ Send me a word to get started.",
  tooLong: "📏 That's too long. Please send a single word or a short phrase.",
  invalidChars:
    "🔤 Please use letters only, with no numbers or symbols like . , $ @ #.",
  notLinked:
    "🔗 Your account isn't connected yet. Open the app and tap “Connect to Telegram”.",
  error: "😕 Something went wrong. Please try again in a moment.",
  notAWord:
    "🤔 I couldn't match that to a valid word. Check the spelling and try again.",
  expired: "⌛ This request expired. Please send the word again.",
  aiError: "🤖 I couldn't look that up right now. Please try again.",

  confirmed: (word: string, pos: string) =>
    `✅ Ready: ${word} (${pos})\n(details coming soon)`,

  useButtons: "👆 Please pick one of the options above, or tap Cancel.",
  cancelled: "🛑 Cancelled. Send me a new word anytime.",
  cancelButton: "❌ Cancel",

  searching: (word: string) => `🔎 Looking up “${word}”…`,
} as const;
