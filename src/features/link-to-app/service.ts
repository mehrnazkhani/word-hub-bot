import { createServiceClient } from "../../supabase";
import type { Env } from "../../types";

export type LinkResult =
  | "linked"
  | "alreadyLinked"
  | "invalidToken"
  | "expiredToken"
  | "telegramInUse"
  | "error";

type LinkInput = {
  token: string;
  telegramUserId: number;
  chatId: number;
};

export async function linkTelegramAccount(
  env: Env,
  { token, telegramUserId, chatId }: LinkInput,
): Promise<LinkResult> {
  const supabase = createServiceClient(env);

  const { data: link, error } = await supabase
    .from("telegram_links")
    .select("id, token_expires_at, verified_at, telegram_user_id")
    .eq("link_token", token)
    .maybeSingle();

  if (error) {
    console.error("[link] lookup failed:", error);
    return "error";
  }

  if (!link) return "invalidToken";

  if (link.verified_at) {
    return link.telegram_user_id === telegramUserId
      ? "alreadyLinked"
      : "invalidToken";
  }

  if (new Date(link.token_expires_at) < new Date()) return "expiredToken";

  const { error: updateError } = await supabase
    .from("telegram_links")
    .update({
      telegram_chat_id: chatId,
      telegram_user_id: telegramUserId,
      verified_at: new Date().toISOString(),
    })
    .eq("id", link.id)
    .is("verified_at", null);

  if (updateError) {
    // 23505 = unique violation (telegram account already linked elsewhere)
    if (updateError.code === "23505") return "telegramInUse";

    console.error("[link] update failed:", updateError);
    return "error";
  }

  return "linked";
}
