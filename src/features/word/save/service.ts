import { LANGUAGES, TELEGRAM_CATEGORY_NAME } from "../../../config";
import { createServiceClient } from "../../../supabase";
import { PARTS_OF_SPEECH, splitRelatedWords, WORD_LIMITS } from "../shared";
import type { Env } from "../../../types";
import type { WordDetails } from "../../ai/details";

export type SaveResult =
  | { status: "success" }
  | { status: "duplicate" }
  | { status: "limit_reached" }
  | { status: "error" };

type SaveInput = {
  userId: string;
  word: string;
  pos: string;
  details: WordDetails;
};

const clamp = (value: string | undefined, max: number) =>
  (value ?? "").trim().slice(0, max);

const toRelated = (value: string) =>
  splitRelatedWords(value)
    .map((w) => w.slice(0, WORD_LIMITS.relatedWord))
    .slice(0, WORD_LIMITS.maxRelatedWords);

const getTelegramCategoryId = async (
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
): Promise<number> => {
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", userId)
    .eq("name", TELEGRAM_CATEGORY_NAME)
    .eq("is_system", true)
    .maybeSingle();

  if (error) throw error;
  if (data) return data.id;

  // Fallback: the DB trigger swallows its own errors, so the category may be missing.
  const { data: created, error: createError } = await supabase
    .from("categories")
    .insert({ user_id: userId, name: TELEGRAM_CATEGORY_NAME, is_system: true })
    .select("id")
    .single();

  if (createError) throw createError;
  return created.id;
};

export const saveWord = async (
  env: Env,
  { userId, word, pos, details }: SaveInput,
): Promise<SaveResult> => {
  try {
    const cleanWord = clamp(word, WORD_LIMITS.word);
    const translation = clamp(details.translation, WORD_LIMITS.translation);
    if (!cleanWord || !translation) return { status: "error" };

    const supabase = createServiceClient(env);
    const categoryId = await getTelegramCategoryId(supabase, userId);

    const { error } = await supabase.from("words").insert({
      user_id: userId,
      category_id: categoryId,
      word: cleanWord,
      translation,
      part_of_speech: pos as (typeof PARTS_OF_SPEECH)[number],
      source_language_id: LANGUAGES.sourceId,
      target_language_id: LANGUAGES.targetId,
      example: clamp(details.example, WORD_LIMITS.example) || null,
      description: clamp(details.description, WORD_LIMITS.description) || null,
      synonyms: toRelated(details.synonyms),
      antonyms: toRelated(details.antonyms),
      source: "manual",
    });

    if (error) {
      if (error.message.includes("WORD_LIMIT_REACHED")) {
        return { status: "limit_reached" };
      }
      // 23505 = unique violation, enforced by the DB index
      if (error.code === "23505") {
        return { status: "duplicate" };
      }
      console.error("[save] insert failed:", error);
      return { status: "error" };
    }

    return { status: "success" };
  } catch (err) {
    console.error("[save] failed:", err);
    return { status: "error" };
  }
};
