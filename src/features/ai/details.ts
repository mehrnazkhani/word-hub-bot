import { z } from "zod";
import { LANGUAGES } from "../../config";
import type { Env } from "../../types";
import { generateStructured } from "./generate";
import {
  PARTS_OF_SPEECH,
  splitRelatedWords,
  WORD_LIMITS,
} from "../word/shared";
import { buildWordPrompt, normalizeWord, uniqueBy } from "./prompt-utils";

const schema = z.object({
  translation: z
    .string()
    .describe(`most common ${LANGUAGES.target} translation of the word`),
  synonyms: z
    .string()
    .describe(
      `comma-separated ${LANGUAGES.source} synonyms, Latin alphabet only. "" if none`,
    ),
  antonyms: z
    .string()
    .describe(
      `comma-separated ${LANGUAGES.source} antonyms, Latin alphabet only. "" if none`,
    ),
  example: z
    .string()
    .describe(`one short natural ${LANGUAGES.source} sentence using the word`),
  description: z
    .string()
    .describe(`plain definition in ${LANGUAGES.target}, one short sentence`),
});

export type WordDetails = z.infer<typeof schema> & { partOfSpeech: string };

const RULES = `
You are a dictionary assistant.

Source language: ${LANGUAGES.source}
Target language: ${LANGUAGES.target}

You receive a word in <word> and its part of speech in <pos>.
Use the word strictly as that part of speech in every field.

Rules:
- translation: the most common translation of the word in that part of speech.
- synonyms / antonyms: up to ${WORD_LIMITS.maxRelatedWords} each, same part of speech, never the word itself. Return "" if no real synonym or antonym exists. Do not force one.
- example: one simple, natural sentence that uses the word (or an inflected form of it).
- description: a plain definition of the word in that part of speech. Do not just repeat the translation.
- Language: synonyms, antonyms and example must be ${LANGUAGES.source} words in the Latin alphabet only, never any other script. Only translation and description use ${LANGUAGES.target}.
- Use "" for any field you are not sure about.
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

const cleanList = (value: string, word: string) => {
  const items = splitRelatedWords(value).filter(
    (w) =>
      !EMPTY_VALUES.has(w.toLowerCase()) &&
      LATIN_WORD.test(w) &&
      w.toLowerCase() !== word.toLowerCase(),
  );

  return uniqueBy(items, (w) => w)
    .slice(0, WORD_LIMITS.maxRelatedWords)
    .join(", ");
};

export const getWordDetails = async (
  env: Env,
  rawWord: string,
  pos: string,
): Promise<WordDetails> => {
  if (!(PARTS_OF_SPEECH as readonly string[]).includes(pos)) {
    throw new Error(`Invalid part of speech: ${pos}`);
  }

  const word = normalizeWord(rawWord);

  const d = await generateStructured(env, {
    schema,
    // Static rules first, variable parts last (better for prompt caching)
    prompt: `${buildWordPrompt(RULES, word)}\n<pos>${pos}</pos>`,
  });

  return {
    translation: cleanText(d.translation),
    partOfSpeech: pos,
    synonyms: cleanList(d.synonyms, word),
    antonyms: cleanList(d.antonyms, word),
    example: cleanLatinText(d.example),
    description: cleanText(d.description),
  };
};
