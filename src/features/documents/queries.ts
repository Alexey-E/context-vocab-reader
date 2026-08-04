import "server-only";

import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export async function listSampleDocuments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sample_documents")
    .select(
      "id, slug, title, source_language, target_language, sort_order, created_at",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load sample documents.", { cause: error });
  }

  return data;
}

export async function getSampleDocument(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sample_documents")
    .select(
      "id, slug, title, content, source_language, target_language, sort_order, created_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to load the sample document.", { cause: error });
  }

  return data;
}

export async function listDocuments() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, title, source_language, target_language, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to load documents.", { cause: error });
  }

  return data;
}

export async function getDocument(id: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("documents")
    .select(
      "id, title, content, source_language, target_language, reading_position, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to load the document.", { cause: error });
  }

  return data;
}

export function isDocumentId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
