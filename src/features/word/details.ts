import { z } from "zod";
import { LANGUAGES } from "../../config";
import type { Env } from "../../types";
import { generateStructured } from "../ai/generate";
import { PARTS_OF_SPEECH, WORD_LIMITS } from "./shared";

export const wordDetailsSchema = z.object({
  translation: z.string(),
  partOfSpeech: z.string(),
  synonyms: z.string(),
  antonyms: z.string(),
  example: z.string(),
  description: z.string(),
});

export type WordDetails = z.infer<typeof wordDetailsSchema>;

function buildPrompt(word: string) {
  const source = LANGUAGES.source;
  const target = LANGUAGES.target;

  return `
You are a dictionary assistant.

Word: "${word}"
Source language: ${source}
Target language: ${target}

Return all fields below. Use "" when unknown or none.

- translation: translate "${word}" to ${target}.
- partOfSpeech: exactly one of: ${PARTS_OF_SPEECH.join(", ")}.
  Use "" only if none fits.
- synonyms: up to ${WORD_LIMITS.maxRelatedWords} comma-separated synonyms in ${source}.
- antonyms: up to ${WORD_LIMITS.maxRelatedWords} comma-separated antonyms in ${source}.
- example: one natural sentence using "${word}" in ${source}.
- description: short explanation in ${target}.

Example shape:
{"translation":"...","partOfSpeech":"noun","synonyms":"...","antonyms":"","example":"...","description":"..."}
`;
}

export function getWordDetails(env: Env, word: string) {
  return generateStructured(env, {
    schema: wordDetailsSchema,
    prompt: buildPrompt(word),
  });
}
