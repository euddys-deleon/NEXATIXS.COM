"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";

const STATUS_OPTIONS = ["activa", "suspendida"];

export function ClientToolRow({
  clientTool,
}: {
  clientTool: {
    id: string;
    status: string;
    tool: { name: string; url: string | null; version: string | null } | null;
  };
}) {
  const t = useTranslations("Admin.clients.detail");
  const tStatus = useTranslations("Estatus.clientToolStatus");
  const router = useRouter();

  async function updateStatus(status: string) {
    await supabase.from("client_tools").update({ status }).eq("id", clientTool.id);
    router.refresh();
  }

  async function handleRemove() {
    await supabase.from("client_tools").delete().eq("id", clientTool.id);
    router.refresh();
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 px-3 py-2 text-sm">
      <div>
        <p className="font-medium text-foreground">{clientTool.tool?.name ?? "—"}</p>
        {clientTool.tool?.url && (
          <a
            href={clientTool.tool.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-brand-blue hover:underline"
          >
            {clientTool.tool.url}
          </a>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Select
          defaultValue={clientTool.status}
          onChange={(event) => updateStatus(event.target.value)}
          className="h-8 w-auto text-xs"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {tStatus(option)}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={handleRemove}
          aria-label={t("unassignTool")}
          className="text-foreground/40 hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
