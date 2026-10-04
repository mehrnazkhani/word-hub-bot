import type { BotConversation, ConversationContext } from "../../context";
import type { WordDetails } from "../ai/details";
import type { Env } from "../../types";

export type StepInput = {
  conversation: BotConversation;
  ctx: ConversationContext;
  env: Env;
  word: string;
  /** Message IDs with live inline buttons — deleted if the user cancels. */
  pendingInline: number[];
};

export type StepResult = Promise<string | null>;

export type PosResult =
  | { ok: true; pos: string }
  | { ok: false; reason: "error" | "none" };

export type DetailsInput = StepInput & { pos: string };

export type SaveStepInput = DetailsInput & {
  userId: string;
  details: WordDetails;
  cardHtml: string;
};
