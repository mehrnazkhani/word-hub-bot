import { z } from "zod";
import { LANGUAGES } from "../../config";
import type { Env } from "../../types";
import { generateStructured } from "./generate";

const schema = z.object({
  isCorrect: z.boolean(),
  suggestions: z
    .array(z.object({ word: z.string(), explanation: z.string() }))
    .max(3),
});

const buildPrompt = (word: string) => `
You are a strict spelling correction engine.

Your ONLY task is spelling correction.

Input word:
"${word}"

Language:
${LANGUAGES.source}

Rules:

- If the word is spelled correctly, return:
{
  "isCorrect": true,
  "suggestions": []
}

- If the word is misspelled:
  - Return maximum 3 suggestions.
  - Every suggestion MUST be a different word.
  - Never return duplicate words.
  - Suggestions must be ranked by spelling similarity.
  - Only return the closest spelling corrections.
  - Do not suggest synonyms.
  - Do not suggest related words.
  - Do not use word meaning to find suggestions.
  - Prefer the smallest spelling changes:
    - missing letters
    - extra letters
    - wrong letters
    - swapped adjacent letters

Important:
- This is NOT a translation task.
- This is NOT a vocabulary task.
- Ignore meanings when selecting suggestions.
- Only analyze the spelling pattern.

For each suggestion, return:

{
  "word": "correct word",
  "explanation": "short dictionary-style definition"
}

Explanation rules:
- Explanation is NOT a translation.
- Do NOT translate the word.
- Explain what the word means in simple words.
- Maximum 8 words.
- Write explanation in ${LANGUAGES.explanation}.

Before returning:
- Check the suggestions array.
- Remove duplicate words.
- Make sure every "word" value is unique.

Return ONLY valid JSON.
`;

export const checkSpelling = (env: Env, word: string) =>
  generateStructured(env, {
    schema,
    prompt: buildPrompt(word),
    timeoutMs: 10_000,
  });
