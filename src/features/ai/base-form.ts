import { z } from "zod";
import { LANGUAGES } from "../../config";
import type { Env } from "../../types";
import { generateStructured } from "./generate";
import { buildWordPrompt, normalizeWord } from "./prompt-utils";

const schema = z.object({
  isBaseForm: z
    .boolean()
    .describe("true if the word is already its own dictionary headword"),
  formDescription: z
    .string()
    .describe(
      'grammatical form, e.g. "plural noun", "past tense", "present participle". Empty if isBaseForm is true',
    ),
  baseForm: z
    .string()
    .describe(
      "the lemma (dictionary headword), different from the input. Empty if isBaseForm is true",
    ),
});

type BaseFormResult = z.infer<typeof schema>;

const RULES = `
You are a lemmatizer for ${LANGUAGES.source}.

The text inside <word> is a correctly spelled ${LANGUAGES.source} word. Decide whether it is an inflected form of another word, and if so give its lemma (dictionary headword).

Inflected (isBaseForm = false):
- Inflectional forms only: plural, verb conjugation, participle, comparative/superlative, case, gender, and similar.
- Irregular and suppletive forms count (e.g. "ran" → "run", "better" → "good").
- If the word has several readings, choose the most common one.

Base form (isBaseForm = true):
- The word is already a headword.
- Derived words (e.g. "happiness", "quickly") are NOT inflections; treat them as base forms.

If isBaseForm is true, leave formDescription and baseForm empty.
Otherwise baseForm must be a real ${LANGUAGES.source} word that differs from the input.
`;

const BASE: BaseFormResult = {
  isBaseForm: true,
  formDescription: "",
  baseForm: "",
};

// Enforce what prompts can't guarantee
const postProcess = (word: string, result: BaseFormResult): BaseFormResult => {
  if (result.isBaseForm) return BASE;

  const baseForm = result.baseForm.trim();

  // Model contradicted itself: no lemma, or lemma equals the input
  if (!baseForm || baseForm.toLowerCase() === word.toLowerCase()) return BASE;

  return {
    isBaseForm: false,
    formDescription: result.formDescription.trim(),
    baseForm,
  };
};

export const checkBaseForm = async (
  env: Env,
  rawWord: string,
): Promise<BaseFormResult> => {
  const word = normalizeWord(rawWord);
  if (!word) return BASE;

  const result = await generateStructured(env, {
    schema,
    prompt: buildWordPrompt(RULES, word),
  });

  return postProcess(word, result);
};
