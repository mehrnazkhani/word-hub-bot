import { createServiceClient } from "../../supabase";
import type { Env } from "../../types";

export type LinkedUserResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "notLinked" | "error" };

export const getLinkedUser = async (
  env: Env,
  telegramUserId: number,
): Promise<LinkedUserResult> => {
  const supabase = createServiceClient(env);

  const { data, error } = await supabase
    .from("telegram_links")
    .select("user_id")
    .eq("telegram_user_id", telegramUserId)
    .not("verified_at", "is", null)
    .maybeSingle();

  if (error) {
    console.error("[user] link lookup failed:", error);
    return { ok: false, reason: "error" };
  }

  if (!data) return { ok: false, reason: "notLinked" };

  return { ok: true, userId: data.user_id };
};
