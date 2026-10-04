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
  reasoningEffort?: "none" | "low",
): Promise<z.infer<T>> => {
  const result = await generateText({
    model,
    abortSignal: AbortSignal.timeout(timeoutMs),
    output: Output.object({ schema }),
    ...(reasoningEffort && {
      providerOptions: { groq: { reasoningEffort } },
    }),
    prompt: prompt.trim(),
  });

  return result.output as z.infer<T>;
};

const runGroq = async <T extends z.ZodType>(
  groq: ReturnType<typeof createGroq>,
  modelId: string,
  options: Options<T>,
): Promise<z.infer<T>> => {
  // gpt-oss rejects reasoningEffort "none"; qwen works best with it disabled
  const reasoningEffort = modelId.includes("gpt-oss") ? "low" : "none";
  return run(groq(modelId), options, reasoningEffort as "none" | "low");
};

export const generateStructured = async <T extends z.ZodType>(
  env: Env,
  options: Options<T>,
): Promise<z.infer<T>> => {
  const groq = createGroq({ apiKey: env.GROQ_API_KEY });

  // 1) Primary: Groq model from secret (e.g. openai/gpt-oss-120b)
  try {
    const output = await runGroq(groq, env.GROQ_MODEL, options);
    console.log(`[ai] answered by Groq (${env.GROQ_MODEL})`);
    return output;
  } catch (err) {
    console.warn("[ai] Groq primary failed, falling back to Google:", err);
  }

  // 2) Google Gemini
  try {
    const google = createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY });
    const output = await run(google(env.GEMINI_MODEL), options);
    console.log(`[ai] answered by Google (${env.GEMINI_MODEL})`);
    return output;
  } catch (err) {
    console.warn("[ai] Google failed, falling back to Groq fallback:", err);
  }

  // 3) Final fallback: Groq qwen
  const output = await runGroq(groq, AI_MODELS.groqFallback, options);
  console.log(`[ai] answered by Groq fallback (${AI_MODELS.groqFallback})`);
  return output;
};
