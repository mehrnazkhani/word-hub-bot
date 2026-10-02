export const WORD_LIMITS = {
  word: 50,
  translation: 200,
  description: 500,
  example: 200,
  relatedWord: 50,
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
