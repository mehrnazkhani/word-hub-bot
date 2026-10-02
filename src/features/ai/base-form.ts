import { z } from "zod";
import { LANGUAGES } from "../../config";
import type { Env } from "../../types";
import { generateStructured } from "./generate";

const schema = z.object({
  isBaseForm: z.boolean(),
  formDescription: z.string(),
  baseForm: z.string(),
});

const buildPrompt = (word: string) => `
Check if this word is in its base form in ${LANGUAGES.source}.
Word: "${word}"

IMPORTANT: The base form must be DIFFERENT from the input word.

Examples of non-base forms:
- "books" → plural noun, base form is "book"
- "ran" → past tense, base form is "run"
- "runs" → third person singular, base form is "run"
- "running" → present participle, base form is "run"
- "better" → comparative adjective, base form is "good"
- "children" → plural noun, base form is "child"

Rules:
- If the word IS already in base form: { "isBaseForm": true, "formDescription": "", "baseForm": "" }
- If the word is NOT in base form: {
    "isBaseForm": false,
    "formDescription": "plural noun" | "past tense" | "third person singular" | "present participle" | "comparative" | etc,
    "baseForm": "the actual different base form word"
  }

Never return the same word as the base form.
`;

export const checkBaseForm = (env: Env, word: string) =>
  generateStructured(env, {
    schema,
    prompt: buildPrompt(word),
    timeoutMs: 10_000,
  });
