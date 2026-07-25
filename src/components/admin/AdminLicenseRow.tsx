"use client";

import { useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const STATUS_OPTIONS = ["activa", "por_vencer", "expirada"];

export function AdminLicenseRow({
  license,
  clientUsers,
}: {
  license: {
    id: string;
    name: string;
    category: string | null;
    status: string;
    expires_at: string | null;
    seats: number;
    assigned_to: string | null;
  };
  clientUsers: { id: string; full_name: string }[];
}) {
  const t = useTranslations("Admin.clients.detail");
  const tStatus = useTranslations("Estatus.licenseStatus");
  const router = useRouter();
  const [seats, setSeats] = useState(license.seats);
  const [busy, setBusy] = useState(false);

  async function update(patch: {
    status?: string;
    expires_at?: string | null;
    seats?: number;
    assigned_to?: string | null;
  }) {
    setBusy(true);
    await supabase.from("licenses").update(patch).eq("id", license.id);
    setBusy(false);
    router.refresh();
  }

  async function handleRenew() {
    const nextYear = new Date();
    nextYear.setDate(nextYear.getDate() + 365);
    await update({ status: "activa", expires_at: nextYear.toISOString().slice(0, 10) });
  }

  async function handleDelete() {
    setBusy(true);
    await supabase.from("licenses").delete().eq("id", license.id);
    setBusy(false);
    router.refresh();
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-foreground/10 px-3 py-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-[160px]">
        <p className="font-medium text-foreground">
          {license.name} {license.category && <span className="text-foreground/50">— {license.category}</span>}
        </p>
        {license.expires_at && (
          <p className="text-xs text-foreground/50">
            {t("licenseExpiry")}: {new Date(license.expires_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-foreground/50">{t("seats")}</span>
          <Input
            type="number"
            min={0}
            value={seats}
            onChange={(event) => setSeats(Number(event.target.value))}
            onBlur={() => seats !== license.seats && update({ seats })}
            className="h-8 w-16 text-xs"
          />
        </div>

        <Select
          defaultValue={license.status}
          onChange={(event) => update({ status: event.target.value })}
          className="h-8 w-auto text-xs"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {tStatus(option)}
            </option>
          ))}
        </Select>

        <Select
          defaultValue={license.assigned_to ?? ""}
          onChange={(event) => update({ assigned_to: event.target.value || null })}
          className="h-8 w-auto text-xs"
        >
          <option value="">{t("unassigned")}</option>
          {clientUsers.map((cu) => (
            <option key={cu.id} value={cu.id}>
              {cu.full_name}
            </option>
          ))}
        </Select>

        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={handleRenew}>
          <RefreshCw size={14} />
          {t("renew")}
        </Button>
        <button
          type="button"
          disabled={busy}
          onClick={handleDelete}
          aria-label={t("delete")}
          className="text-foreground/40 hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
