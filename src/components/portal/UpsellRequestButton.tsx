"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function UpsellRequestButton({
  clientId,
  requestedBy,
  itemName,
}: {
  clientId: string;
  requestedBy: string;
  itemName: string;
}) {
  const t = useTranslations("Portal.upsell");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRequest() {
    setLoading(true);
    await supabase.from("upsell_requests").insert({
      client_id: clientId,
      requested_by: requestedBy,
      item_name: itemName,
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
        <CheckCircle2 size={14} />
        {t("requestSent")}
      </span>
    );
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleRequest} disabled={loading}>
      {t("request")}
    </Button>
  );
}
