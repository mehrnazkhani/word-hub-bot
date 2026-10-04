export const LANGUAGES = {
  source: "English",
  target: "Persian",
  explanation: "English",
  sourceId: 1, // en
  targetId: 3, // fa
} as const;

export const TELEGRAM_CATEGORY_NAME = "Telegram Words";

export const AI_MODEL = "";

export const AI_MODELS = {
  // Final fallback when GROQ_MODEL and Gemini both fail
  groqFallback: "qwen/qwen3-32b",
} as const;
