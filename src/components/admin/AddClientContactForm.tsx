"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";

export function AddClientContactForm({ clientId }: { clientId: string }) {
  const t = useTranslations("Admin.clients.detail");
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [permissions, setPermissions] = useState({
    canApproveQuotes: false,
    canReceiveInvoices: false,
    canOpenTickets: false,
    canManageLicenses: false,
  });
  const [submitting, setSubmitting] = useState(false);

  function togglePermission(key: keyof typeof permissions) {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!fullName.trim()) return;
    setSubmitting(true);
    await supabase.from("client_contacts").insert({
      client_id: clientId,
      full_name: fullName.trim(),
      position: position.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      department: department.trim() || null,
      can_approve_quotes: permissions.canApproveQuotes,
      can_receive_invoices: permissions.canReceiveInvoices,
      can_open_tickets: permissions.canOpenTickets,
      can_manage_licenses: permissions.canManageLicenses,
    });
    setSubmitting(false);
    setFullName("");
    setPosition("");
    setEmail("");
    setPhone("");
    setDepartment("");
    setPermissions({
      canApproveQuotes: false,
      canReceiveInvoices: false,
      canOpenTickets: false,
      canManageLicenses: false,
    });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label={t("contactFullName")} htmlFor="contactFullName">
          <Input id="contactFullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label={t("contactPosition")} htmlFor="contactPosition">
          <Input id="contactPosition" value={position} onChange={(e) => setPosition(e.target.value)} />
        </Field>
        <Field label={t("contactDepartment")} htmlFor="contactDepartment">
          <Input id="contactDepartment" value={department} onChange={(e) => setDepartment(e.target.value)} />
        </Field>
        <Field label={t("contactEmail")} htmlFor="contactEmail">
          <Input id="contactEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t("contactPhone")} htmlFor="contactPhone">
          <Input id="contactPhone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <Checkbox
            checked={permissions.canApproveQuotes}
            onChange={() => togglePermission("canApproveQuotes")}
          />
          {t("permApproveQuotes")}
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <Checkbox
            checked={permissions.canReceiveInvoices}
            onChange={() => togglePermission("canReceiveInvoices")}
          />
          {t("permReceiveInvoices")}
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <Checkbox
            checked={permissions.canOpenTickets}
            onChange={() => togglePermission("canOpenTickets")}
          />
          {t("permOpenTickets")}
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <Checkbox
            checked={permissions.canManageLicenses}
            onChange={() => togglePermission("canManageLicenses")}
          />
          {t("permManageLicenses")}
        </label>
      </div>

      <Button type="submit" size="sm" disabled={submitting}>
        {t("addContact")}
      </Button>
    </form>
  );
}
