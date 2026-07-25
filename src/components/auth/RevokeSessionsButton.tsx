"use client";

import { useState } from "react";
import { ShieldOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";
import { hardNavigateTo } from "@/lib/auth/resolve-home";

export function RevokeSessionsButton() {
  const t = useTranslations("Auth.revokeSessions");
  const locale = useLocale();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    if (!window.confirm(t("confirm"))) return;
    setSubmitting(true);

    await fetch("/api/auth/revoke-sessions", { method: "POST" });
    // The server already invalidated the token; this just clears the local
    // copy so the browser doesn't keep presenting a revoked session.
    await supabase.auth.signOut({ scope: "local" });

    hardNavigateTo(locale, "/iniciar-sesion");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      aria-label={t("action")}
      title={t("action")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 transition-colors hover:text-red-500 disabled:opacity-50"
    >
      <ShieldOff size={18} />
    </button>
  );
}
