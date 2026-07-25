// Shared between the client-side check in AttachmentsPanel (immediate
// feedback) and the storage bucket's allowed_mime_types (real server-side
// enforcement, see supabase/migrations/0024_file_upload_hardening.sql).
// Keep these two lists in sync — the client list exists for UX, the bucket
// config is what actually stops a bypass.
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // matches the bucket's file_size_limit

export function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150);
}
