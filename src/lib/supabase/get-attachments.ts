import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export async function getAttachmentsWithUrls(
  supabase: SupabaseClient<Database>,
  entityType: "ticket" | "project",
  entityId: string,
) {
  const { data } = await supabase
    .from("attachments")
    .select("id, file_name, storage_path")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  const items = await Promise.all(
    (data ?? []).map(async (row) => {
      const { data: signed } = await supabase.storage
        .from("attachments")
        .createSignedUrl(row.storage_path, 3600);
      return {
        id: row.id,
        fileName: row.file_name,
        storagePath: row.storage_path,
        url: signed?.signedUrl ?? null,
      };
    }),
  );

  return items;
}
