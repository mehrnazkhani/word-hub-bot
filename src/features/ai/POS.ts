import { z } from "zod";
import { LANGUAGES } from "../../config";
import type { Env } from "../../types";
import { generateStructured } from "./generate";
import { PARTS_OF_SPEECH } from "../word/shared";
import { buildWordPrompt, normalizeWord, uniqueBy } from "./prompt-utils";

const schema = z.object({
  availablePos: z
    .array(
      z.object({
        pos: z.enum(PARTS_OF_SPEECH),
        meaning: z
          .string()
          .describe("most common meaning in this part of speech, max 8 words"),
      }),
    )
    .describe("empty if the word fits none of the allowed parts of speech"),
});

type PosResult = {
  isValid: boolean;
  availablePos: z.infer<typeof schema>["availablePos"];
};

const RULES = `
You are a part-of-speech analyzer for ${LANGUAGES.source}.

The text inside <word> is a correctly spelled ${LANGUAGES.source} word. List every part of speech it is commonly used as.

Rules:
- Include only common, current usages. Skip rare, archaic, or highly technical ones.
- At most one entry per part of speech, most common first.
- Greetings and exclamations such as "hello" or "wow" are "interjection".
- "meaning" is the word's meaning in that specific part of speech: a plain definition in ${LANGUAGES.explanation}, max 8 words.
- If the word fits none of the allowed parts of speech, return an empty array.
`;

// Enforce what prompts can't guarantee
const postProcess = (result: z.infer<typeof schema>): PosResult => {
  const availablePos = uniqueBy(
    result.availablePos
      .map((p) => ({ pos: p.pos, meaning: p.meaning.trim() }))
      .filter((p) => p.meaning),
    (p) => p.pos,
  );

  // Exactly one part of speech means no choice is needed
  return { isValid: availablePos.length === 1, availablePos };
};

export const checkPos = async (
  env: Env,
  rawWord: string,
): Promise<PosResult> => {
  const word = normalizeWord(rawWord);
  if (!word) return { isValid: false, availablePos: [] };

  const result = await generateStructured(env, {
    schema,
    prompt: buildWordPrompt(RULES, word),
  });

  return postProcess(result);
};
