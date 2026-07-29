"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["activa", "mantenimiento", "inactiva"];

type Tool = {
  id: string;
  code: string;
  name: string;
  url: string | null;
  status: string;
  version: string | null;
};

export function ToolRow({ tool }: { tool: Tool }) {
  const t = useTranslations("Admin.tools");
  const tStatus = useTranslations("Estatus.toolStatus");
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(tool.name);
  const [url, setUrl] = useState(tool.url ?? "");
  const [version, setVersion] = useState(tool.version ?? "");

  async function updateStatus(status: string) {
    await supabase.from("tools").update({ status }).eq("id", tool.id);
    router.refresh();
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await supabase
      .from("tools")
      .update({ name: name.trim(), url: url.trim() || null, version: version.trim() || null })
      .eq("id", tool.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm(t("confirmDelete"))) return;
    await supabase.from("tools").delete().eq("id", tool.id);
    router.refresh();
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-brand-blue/30 bg-background p-4"
      >
        <Field label={t("name")} htmlFor={`name-${tool.id}`} className="min-w-[180px] flex-1">
          <Input id={`name-${tool.id}`} value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label={t("url")} htmlFor={`url-${tool.id}`} className="min-w-[180px] flex-1">
          <Input id={`url-${tool.id}`} value={url} onChange={(event) => setUrl(event.target.value)} />
        </Field>
        <Field label={t("version")} htmlFor={`version-${tool.id}`}>
          <Input
            id={`version-${tool.id}`}
            value={version}
            onChange={(event) => setVersion(event.target.value)}
          />
        </Field>
        <Button type="submit" size="sm" disabled={saving}>
          {t("save")}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
          {t("cancel")}
        </Button>
      </form>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-background p-4",
        tool.status === "inactiva" && "opacity-60",
      )}
    >
      <div className="min-w-[220px] flex-1">
        <p className="font-medium text-foreground">
          {tool.name} <span className="text-foreground/40">({tool.code})</span>
        </p>
        <p className="text-xs text-foreground/50">
          {tool.url && (
            <a href={tool.url} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">
              {tool.url}
            </a>
          )}
          {tool.url && tool.version && " · "}
          {tool.version && `v${tool.version}`}
        </p>
      </div>

      <Select
        defaultValue={tool.status}
        onChange={(event) => updateStatus(event.target.value)}
        className="h-8 w-auto text-xs"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {tStatus(option)}
          </option>
        ))}
      </Select>

      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
          {t("edit")}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={handleDelete}>
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}
