import "server-only";

import { getAuthContext } from "@/lib/auth/require-user";
import { logServerError } from "@/lib/log-server-error";
import type { ReaderVocabularyCard } from "@/features/vocabulary/contract";

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
