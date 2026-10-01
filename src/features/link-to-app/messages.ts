export const messages = {
  link: {
    noToken:
      "👋 Welcome to Word Hub!\n\nTo connect your account, open the app and tap “Connect to Telegram”.",
    linked: "✅ Your Telegram account is now connected!",
    alreadyLinked: "ℹ️ This account is already connected.",
    invalidToken: "❌ This link is invalid. Please try again from the app.",
    expiredToken:
      "⏰ This link has expired. Please get a new one from the app.",
    telegramInUse:
      "⚠️ This Telegram account is already connected to another Word Hub account.",
    error: "😕 Something went wrong. Please try again in a moment.",
  },
} as const;
