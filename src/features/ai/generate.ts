import { createGroq } from "@ai-sdk/groq";
import { generateText, Output } from "ai";
import z from "zod";
import { AI_MODEL } from "../../config";
import type { Env } from "../../types";

type Options<T extends z.ZodType> = {
  schema: T;
  prompt: string;
  timeoutMs?: number;
};

export const generateStructured = async <T extends z.ZodType>(
  env: Env,
  { schema, prompt, timeoutMs = 15_000 }: Options<T>,
): Promise<z.infer<T>> => {
  const groq = createGroq({ apiKey: env.GROQ_API_KEY });

  const result = await generateText({
    model: groq(AI_MODEL),
    abortSignal: AbortSignal.timeout(timeoutMs),
    output: Output.object({ schema }),
    providerOptions: { groq: { reasoningEffort: "none" } },
    prompt: prompt.trim(),
  });

  return result.output as z.infer<T>;
};
