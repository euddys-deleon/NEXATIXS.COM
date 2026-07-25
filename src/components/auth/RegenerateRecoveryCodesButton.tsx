"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase/client";
import { RecoveryCodesModal } from "@/components/auth/RecoveryCodesModal";

// Regenerar invalida cualquier codigo sin usar del set anterior (mismo
// comportamiento que generate_recovery_codes() al activarse por primera
// vez) — por eso pide confirmacion antes de llamarla.
export function RegenerateRecoveryCodesButton() {
  const t = useTranslations("Auth.recoveryCodes");
  const [submitting, setSubmitting] = useState(false);
  const [codes, setCodes] = useState<string[] | null>(null);

  async function handleClick() {
    if (!window.confirm(t("regenerateConfirm"))) return;
    setSubmitting(true);

    const { data, error: rpcError } = await supabase.rpc("generate_recovery_codes");
    setSubmitting(false);

    if (rpcError || !data) {
      window.alert(t("regenerateError"));
      return;
    }

    setCodes(data);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        aria-label={t("regenerateButton")}
        title={t("regenerateButton")}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 transition-colors hover:text-brand-blue disabled:opacity-50"
      >
        <KeyRound size={18} />
      </button>
      {codes && <RecoveryCodesModal codes={codes} onClose={() => setCodes(null)} />}
    </>
  );
}
