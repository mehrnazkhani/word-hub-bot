export const WORD_MAX_LENGTH = 100;

export type WordValidation =
  | { ok: true; word: string }
  | { ok: false; reason: "empty" | "tooLong" | "invalidChars" };

const WORD_PATTERN = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;

export const validateWordInput = (raw: string): WordValidation => {
  const word = raw.normalize("NFC").replace(/\s+/g, " ").trim();

  if (!word) return { ok: false, reason: "empty" };
  if (word.length > WORD_MAX_LENGTH) return { ok: false, reason: "tooLong" };
  if (!WORD_PATTERN.test(word)) return { ok: false, reason: "invalidChars" };

  return { ok: true, word };
};
