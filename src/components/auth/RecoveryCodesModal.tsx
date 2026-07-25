"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

// Los codigos solo existen en claro en la respuesta de generate_recovery_codes()
// — Supabase (y nuestra base de datos) nunca los vuelve a exponer despues.
// Este modal es la unica oportunidad que tiene el usuario de verlos: se
// bloquea la salida hasta que confirme explicitamente haberlos guardado.
export function RecoveryCodesModal({ codes, onClose }: { codes: string[]; onClose: () => void }) {
  const t = useTranslations("Auth.recoveryCodes");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
    } catch {
      // API de portapapeles no disponible (permisos, contexto no seguro) —
      // los codigos siguen visibles en pantalla para copiarlos a mano.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-foreground/10 bg-background p-6 shadow-xl">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t("title")}</h2>
        <p className="mt-2 text-sm text-foreground/60">{t("subtitle")}</p>
        <p className="mt-3 text-sm font-medium text-amber-500">{t("warning")}</p>

        <ul className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-foreground/10 bg-background-subtle p-4 font-mono text-sm text-foreground">
          {codes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          <Button type="button" variant="outline" onClick={handleCopy} className="w-full">
            {copied ? t("copied") : t("copyButton")}
          </Button>
          <Button type="button" onClick={onClose} className="w-full">
            {t("continueButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
