import { z } from "zod";
import { LANGUAGES } from "../../config";
import type { Env } from "../../types";
import { generateStructured } from "./generate";
import { splitRelatedWords, WORD_LIMITS } from "../word/shared";

const schema = z.object({
  translation: z.string(),
  partOfSpeech: z.string(),
  synonyms: z.string(),
  antonyms: z.string(),
  example: z.string(),
  description: z.string(),
});

export type WordDetails = z.infer<typeof schema>;

const buildPrompt = (word: string, pos: string) => `
You are a dictionary assistant.

Word: "${word}"
Part of speech: ${pos}
Source language: ${LANGUAGES.source}
Target language: ${LANGUAGES.target}

Use the word strictly as a ${pos} in every field below.
Return all fields. Use "" when unknown or none.

- translation: translate "${word}" (as a ${pos}) to ${LANGUAGES.target}.
- partOfSpeech: exactly "${pos}".
- synonyms: up to ${WORD_LIMITS.maxRelatedWords} comma-separated synonyms in ${LANGUAGES.source}.
- antonyms: up to ${WORD_LIMITS.maxRelatedWords} comma-separated antonyms in ${LANGUAGES.source}.
- example: one natural sentence using "${word}" in ${LANGUAGES.source}.
- description: short explanation in ${LANGUAGES.target}.

Strict rule: synonyms, antonyms and example must contain ONLY ${LANGUAGES.source} words written in the Latin alphabet. Never use Chinese, Japanese, Korean, Arabic or any other script in these fields. Only translation and description may use ${LANGUAGES.target}.

Example shape:
{"translation":"...","partOfSpeech":"noun","synonyms":"...","antonyms":"","example":"...","description":"..."}
`;

const EMPTY_VALUES = new Set([
  "null",
  "none",
  "n/a",
  "na",
  "undefined",
  "-",
  "—",
]);

// Latin letters with optional inner space, hyphen or apostrophe: "give up", "well-known"
const LATIN_WORD = /^\p{Script=Latin}+(?:[ '’-]\p{Script=Latin}+)*$/u;

// Latin letters, digits, punctuation, symbols and whitespace only
const LATIN_TEXT = /^[\p{Script=Latin}\p{N}\p{P}\p{S}\s]+$/u;

const cleanText = (value: string) => {
  const v = value.trim();
  return EMPTY_VALUES.has(v.toLowerCase()) ? "" : v;
};

const cleanLatinText = (value: string) => {
  const v = cleanText(value);
  return LATIN_TEXT.test(v) ? v : "";
};

const cleanList = (value: string) =>
  splitRelatedWords(value)
    .filter((w) => !EMPTY_VALUES.has(w.toLowerCase()) && LATIN_WORD.test(w))
    .join(", ");

export const getWordDetails = async (
  env: Env,
  word: string,
  pos: string,
): Promise<WordDetails> => {
  const d = await generateStructured(env, {
    schema,
    prompt: buildPrompt(word, pos),
  });

  return {
    ...d,
    translation: cleanText(d.translation),
    description: cleanText(d.description),
    example: cleanLatinText(d.example),
    synonyms: cleanList(d.synonyms),
    antonyms: cleanList(d.antonyms),
  };
};
