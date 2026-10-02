import { z } from "zod";
import { LANGUAGES } from "../../config";
import type { Env } from "../../types";
import { generateStructured } from "./generate";
import { WORD_LIMITS } from "../word/shared";

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

Example shape:
{"translation":"...","partOfSpeech":"noun","synonyms":"...","antonyms":"","example":"...","description":"..."}
`;

export const getWordDetails = (env: Env, word: string, pos: string) =>
  generateStructured(env, { schema, prompt: buildPrompt(word, pos) });
