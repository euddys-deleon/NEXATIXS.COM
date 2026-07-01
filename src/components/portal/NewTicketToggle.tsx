"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NewTicketForm } from "./NewTicketForm";

export function NewTicketToggle({
  clientId,
  createdBy,
}: {
  clientId: string;
  createdBy: string;
}) {
  const t = useTranslations("Portal.tickets");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus size={16} />
        {t("newTicket")}
      </Button>
    );
  }

  return (
    <Card className="bg-background">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">{t("form.title")}</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar"
          className="text-foreground/60 hover:text-foreground"
        >
          <X size={18} />
        </button>
      </div>
      <NewTicketForm clientId={clientId} createdBy={createdBy} onDone={() => setOpen(false)} />
    </Card>
  );
}
