export const WORD_LIMITS = {
  maxRelatedWords: 3,
} as const;

export const PARTS_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
] as const;

export const splitRelatedWords = (value: string): string[] =>
  value
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);
