"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function RenewLicenseButton({
  clientId,
  licenseName,
}: {
  clientId: string;
  licenseName: string;
}) {
  const t = useTranslations("Portal.licenses");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRenew() {
    setLoading(true);
    await supabase.from("upsell_requests").insert({
      client_id: clientId,
      item_name: `Renovación: ${licenseName}`,
      description: `Solicitud de renovación para la licencia "${licenseName}".`,
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
        <CheckCircle2 size={14} />
        {t("renewSent")}
      </span>
    );
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleRenew} disabled={loading}>
      {t("renew")}
    </Button>
  );
}
