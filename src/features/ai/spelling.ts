import { z } from "zod";
import { LANGUAGES } from "../../config";
import type { Env } from "../../types";
import { generateStructured } from "./generate";
import { buildWordPrompt, normalizeWord, uniqueBy } from "./prompt-utils";

const MAX_SUGGESTIONS = 3;

const schema = z.object({
  isCorrect: z
    .boolean()
    .describe("true only if the word is a valid, correctly spelled word"),
  suggestions: z
    .array(
      z.object({
        word: z.string().describe("a real word, spelled correctly"),
        explanation: z
          .string()
          .describe("simple definition, max 8 words, not a translation"),
      }),
    )
    .max(MAX_SUGGESTIONS)
    .describe("empty if isCorrect is true or no close word exists"),
});

type SpellingResult = z.infer<typeof schema>;

const RULES = `
You are a spelling checker for ${LANGUAGES.source}.

Decide whether the text inside <word> is a correctly spelled ${LANGUAGES.source} word.

Correct spelling:
- Accept standard dictionary spellings, accepted regional variants (e.g. color/colour), and well-known proper nouns.
- If correct: isCorrect = true, suggestions = [].

Misspelled (or not a real word):
- isCorrect = false.
- Give up to ${MAX_SUGGESTIONS} real ${LANGUAGES.source} words, closest spelling first.
- Judge closeness by letters only: missing, extra, wrong, or swapped adjacent letters. Ignore meaning; no synonyms or related words.
- Each suggestion must differ from the others and from the input.
- If no word is reasonably close, return an empty array. Do not guess.

Explanation for each suggestion:
- Write in ${LANGUAGES.explanation}.
- A plain definition in at most 8 words. Not a translation.
`;

// Enforce what prompts can't guarantee
const postProcess = (word: string, result: SpellingResult): SpellingResult => {
  if (result.isCorrect) return { isCorrect: true, suggestions: [] };

  const suggestions = uniqueBy(
    result.suggestions.filter(
      (s) => s.word.trim().toLowerCase() !== word.toLowerCase(),
    ),
    (s) => s.word,
  ).slice(0, MAX_SUGGESTIONS);

  return { isCorrect: false, suggestions };
};

export const checkSpelling = async (
  env: Env,
  rawWord: string,
): Promise<SpellingResult> => {
  const word = normalizeWord(rawWord);
  if (!word) return { isCorrect: false, suggestions: [] };

  const result = await generateStructured(env, {
    schema,
    prompt: buildWordPrompt(RULES, word),
  });

  return postProcess(word, result);
};
