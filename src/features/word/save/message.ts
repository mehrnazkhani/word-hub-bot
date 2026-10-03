import { TELEGRAM_CATEGORY_NAME } from "../../../config";

export const saveMessages = {
  saveButton: "💾 Save",
  success: `✅ Saved to ${TELEGRAM_CATEGORY_NAME}`,
  limitReached:
    "⚠️ You've reached your word limit. Delete some words in the app to add more.",
  retry: "❌ Couldn't save this word. Tap Save to try again.",
  failed: "❌ Couldn't save this word. Please try again later.",
  duplicate:
    "ℹ️ This word is already in your list with the same part of speech, so I didn't save it again.",
} as const;
