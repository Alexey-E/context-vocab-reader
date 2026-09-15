import "server-only";

import { getAuthContext, requireUser } from "@/lib/auth/require-user";
import { logServerError } from "@/lib/log-server-error";
import type {
  ReaderVocabularyCard,
  VocabularyCard,
} from "@/features/vocabulary/contract";

export async function listVocabularyCards(): Promise<VocabularyCard[]> {
  const { supabase, userId } = await requireUser();

  const { data, error } = await supabase
    .from("vocabulary_cards")
    .select(
      "id, word, source_language, target_language, translation, usage_context, image_url, note, created_at, updated_at",
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    logServerError("vocabulary.dashboard_cards_failed", error, { userId });
    throw new Error("Failed to load vocabulary cards.", { cause: error });
  }

  return data.map((card) => ({
    createdAt: card.created_at,
    id: card.id,
    imageUrl: card.image_url,
    meanings: card.translation,
    note: card.note,
    sourceLanguage: card.source_language,
    targetLanguage: card.target_language,
    updatedAt: card.updated_at,
    usageContext: card.usage_context,
    word: card.word,
  }));
}

export async function listReaderVocabularyCards(
  sourceLanguage: string,
  targetLanguage: string,
): Promise<ReaderVocabularyCard[]> {
  const auth = await getAuthContext();
  if (!auth.authenticated) return [];

  const { data, error } = await auth.supabase
    .from("vocabulary_cards")
    .select("image_url, note, translation, usage_context, word")
    .eq("user_id", auth.userId)
    .eq("source_language", sourceLanguage)
    .eq("target_language", targetLanguage);

  if (error) {
    logServerError("vocabulary.reader_cards_failed", error, {
      sourceLanguage,
      targetLanguage,
      userId: auth.userId,
    });
    throw new Error("Failed to load reader vocabulary cards.", {
      cause: error,
    });
  }

  return data.map((card) => ({
    imageUrl: card.image_url,
    meanings: card.translation,
    note: card.note,
    usageContext: card.usage_context,
    word: card.word,
  }));
}
