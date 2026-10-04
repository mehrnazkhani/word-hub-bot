import { createGroq } from "@ai-sdk/groq";
import { generateText, Output, LanguageModel } from "ai";
import z from "zod";
import { AI_MODELS } from "../../config";
import type { Env } from "../../types";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

type Options<T extends z.ZodType> = {
  schema: T;
  prompt: string;
  timeoutMs?: number;
};

const run = async <T extends z.ZodType>(
  model: LanguageModel,
  { schema, prompt, timeoutMs = 15_000 }: Options<T>,
  isGroq: boolean,
): Promise<z.infer<T>> => {
  const result = await generateText({
    model,
    abortSignal: AbortSignal.timeout(timeoutMs),
    output: Output.object({ schema }),
    ...(isGroq && {
      providerOptions: { groq: { reasoningEffort: "none" } },
    }),
    prompt: prompt.trim(),
  });

  return result.output as z.infer<T>;
};

export const generateStructured = async <T extends z.ZodType>(
  env: Env,
  options: Options<T>,
): Promise<z.infer<T>> => {
  // 1) Google first
  try {
    const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY });
    const output = await run(google(env.GEMINI_MODEL), options, false);
    console.log(`[ai] answered by Google (${env.GEMINI_MODEL})`);
    return output;
  } catch (err) {
    // Any failure (rate limit, timeout, bad key, invalid JSON) falls through to Groq
    console.warn("[ai] Google failed, falling back to Groq:", err);
  }

  // 2) Groq as fallback
  const groq = createGroq({ apiKey: env.GROQ_API_KEY });
  const output = await run(groq(AI_MODELS.groq), options, true);
  console.log(`[ai] answered by Groq (${AI_MODELS.groq})`);
  return output;
};
