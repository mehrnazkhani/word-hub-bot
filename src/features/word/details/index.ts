import { getWordDetails, type WordDetails } from "../../ai/details";
import type { DetailsInput } from "../types";

export async function runDetailsStep({
  conversation,
  ctx,
  env,
  word,
  pos,
}: DetailsInput): Promise<WordDetails | null> {
  await ctx.replyWithChatAction("typing");

  return conversation.external(async () => {
    try {
      return await getWordDetails(env, word, pos);
    } catch (err) {
      console.error("[details] failed:", err);
      return null;
    }
  });
}
