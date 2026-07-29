"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const STATUS_OPTIONS = ["activa", "mantenimiento", "inactiva"];

export function AddToolForm() {
  const t = useTranslations("Admin.tools");
  const tStatus = useTranslations("Estatus.toolStatus");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [version, setVersion] = useState("");
  const [status, setStatus] = useState("activa");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim() || !name.trim()) return;
    setSubmitting(true);
    await supabase.from("tools").insert({
      code: code.trim().toLowerCase(),
      name: name.trim(),
      url: url.trim() || null,
      version: version.trim() || null,
      status,
    });
    setSubmitting(false);
    setCode("");
    setName("");
    setUrl("");
    setVersion("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Field label={t("code")} htmlFor="toolCode" className="min-w-[120px]">
        <Input id="toolCode" value={code} onChange={(event) => setCode(event.target.value)} />
      </Field>
      <Field label={t("name")} htmlFor="toolName" className="min-w-[200px] flex-1">
        <Input id="toolName" value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <Field label={t("url")} htmlFor="toolUrl" className="min-w-[200px] flex-1">
        <Input
          id="toolUrl"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://"
        />
      </Field>
      <Field label={t("version")} htmlFor="toolVersion" className="min-w-[100px]">
        <Input id="toolVersion" value={version} onChange={(event) => setVersion(event.target.value)} />
      </Field>
      <Field label={t("status")} htmlFor="toolStatus">
        <Select id="toolStatus" value={status} onChange={(event) => setStatus(event.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {tStatus(option)}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" size="sm" disabled={submitting}>
        {t("add")}
      </Button>
    </form>
  );
}
