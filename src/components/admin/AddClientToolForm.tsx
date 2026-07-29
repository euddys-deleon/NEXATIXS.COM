"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function AddClientToolForm({
  clientId,
  availableTools,
}: {
  clientId: string;
  availableTools: { id: string; name: string }[];
}) {
  const t = useTranslations("Admin.clients.detail");
  const router = useRouter();
  const [toolId, setToolId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!toolId) return;
    setSubmitting(true);
    await supabase.from("client_tools").insert({ client_id: clientId, tool_id: toolId });
    setSubmitting(false);
    setToolId("");
    router.refresh();
  }

  if (availableTools.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Select
        value={toolId}
        onChange={(event) => setToolId(event.target.value)}
        className="min-w-[220px]"
      >
        <option value="">{t("selectTool")}</option>
        {availableTools.map((tool) => (
          <option key={tool.id} value={tool.id}>
            {tool.name}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" disabled={submitting || !toolId}>
        {t("assignTool")}
      </Button>
    </form>
  );
}
