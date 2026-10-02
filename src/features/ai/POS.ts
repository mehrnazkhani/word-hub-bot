import { z } from "zod";
import { LANGUAGES } from "../../config";
import type { Env } from "../../types";
import { generateStructured } from "./generate";
import { PARTS_OF_SPEECH } from "../word/shared";

const schema = z.object({
  isValid: z.boolean(),
  availablePos: z.array(z.object({ pos: z.string(), meaning: z.string() })),
});

const buildPrompt = (word: string) => `
Given the word "${word}" in ${LANGUAGES.source}:

Find all valid parts of speech from this list: ${PARTS_OF_SPEECH.join(", ")}.
- If only one: { isValid: true, availablePos: [{ pos, meaning }] }
- If multiple: { isValid: false, availablePos: [{ pos: "noun", meaning: "..." }, ...] }
- If none: { isValid: false, availablePos: [] }

Keep meanings short (max 8 words).
`;

export const checkPos = (env: Env, word: string) =>
  generateStructured(env, {
    schema,
    prompt: buildPrompt(word),
    timeoutMs: 10_000,
  });
