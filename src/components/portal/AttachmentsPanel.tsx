"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Paperclip, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";

export interface AttachmentItem {
  id: string;
  fileName: string;
  storagePath: string;
  url: string | null;
}

export function AttachmentsPanel({
  entityType,
  entityId,
  items,
  canDelete,
}: {
  entityType: "ticket" | "project";
  entityId: string;
  items: AttachmentItem[];
  canDelete: boolean;
}) {
  const t = useTranslations("Portal.attachments");
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const path = `${entityType}/${entityId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("attachments").upload(path, file);

    if (uploadError) {
      setUploading(false);
      setError(t("uploadError"));
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    await supabase.from("attachments").insert({
      entity_type: entityType,
      entity_id: entityId,
      storage_path: path,
      file_name: file.name,
      uploaded_by: userData.user?.id,
    });

    setUploading(false);
    event.target.value = "";
    router.refresh();
  }

  async function handleDelete(id: string, storagePath: string) {
    await supabase.storage.from("attachments").remove([storagePath]);
    await supabase.from("attachments").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground/60">
          {t("title")}
        </h3>
        <label className="cursor-pointer text-xs font-medium text-brand-blue hover:underline">
          {uploading ? t("uploading") : t("upload")}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/60">{t("empty")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-foreground/10 px-3 py-2 text-sm"
            >
              <a
                href={item.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2 text-foreground hover:text-brand-blue"
              >
                <Paperclip size={14} className="shrink-0" />
                <span className="truncate">{item.fileName}</span>
                <Download size={12} className="shrink-0 text-foreground/40" />
              </a>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.storagePath)}
                  aria-label={t("delete")}
                  className="shrink-0 text-foreground/40 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
