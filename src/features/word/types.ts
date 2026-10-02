import type { BotConversation, ConversationContext } from "../../context";
import type { Env } from "../../types";

export type PosResult =
  | { ok: true; pos: string }
  | { ok: false; reason: "error" | "none" };

export type StepInput = {
  conversation: BotConversation;
  ctx: ConversationContext;
  env: Env;
  word: string;
};

export type StepResult = Promise<string | null>;
