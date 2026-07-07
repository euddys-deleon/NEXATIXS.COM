import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getStaffContext } from "@/lib/supabase/get-staff-context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const TABLE_OPTIONS = [
  "clients",
  "invoices",
  "tickets",
  "licenses",
  "projects",
  "upsell_requests",
  "client_contacts",
];

const actionStyles: Record<string, string> = {
  INSERT: "bg-emerald-500/10 text-emerald-600",
  UPDATE: "bg-amber-500/10 text-amber-600",
  DELETE: "bg-red-500/10 text-red-600",
};

export default async function AdminAuditoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ table?: string }>;
}) {
  const { locale } = await params;
  const { table = "" } = await searchParams;
  const { user, staffUser, supabase } = await getStaffContext();

  if (!user || !staffUser) {
    redirect({ href: "/iniciar-sesion", locale });
    return null;
  }

  const t = await getTranslations("Admin.audit");
  const dateLocale = locale === "en" ? "en-US" : "es-DO";

  let query = supabase
    .from("audit_log")
    .select("id, table_name, record_id, action, changed_by, changed_at")
    .order("changed_at", { ascending: false })
    .limit(100);

  if (table) query = query.eq("table_name", table);

  const { data: entries } = await query;
  const allEntries = entries ?? [];

  const changedByIds = [...new Set(allEntries.map((e) => e.changed_by).filter(Boolean))] as string[];

  const [{ data: staffNames }, { data: clientNames }] = await Promise.all([
    changedByIds.length
      ? supabase.from("staff_users").select("id, full_name").in("id", changedByIds)
      : Promise.resolve({ data: [] }),
    changedByIds.length
      ? supabase.from("client_users").select("id, full_name").in("id", changedByIds)
      : Promise.resolve({ data: [] }),
  ]);

  const nameMap = new Map<string, string>();
  for (const s of staffNames ?? []) nameMap.set(s.id, s.full_name);
  for (const c of clientNames ?? []) if (!nameMap.has(c.id)) nameMap.set(c.id, c.full_name);

  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-foreground/60">{t("subtitle")}</p>

        <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
          <Select name="table" defaultValue={table} className="w-auto min-w-[200px]">
            <option value="">{t("allTables")}</option>
            {TABLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Button type="submit" size="md">
            {t("filter")}
          </Button>
        </form>

        <Card className="mt-6 bg-background !p-0">
          {allEntries.length === 0 ? (
            <p className="p-6 text-sm text-foreground/60">{t("empty")}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-xs uppercase tracking-wide text-foreground/50">
                  <th className="px-5 py-3 font-medium">{t("columns.date")}</th>
                  <th className="px-5 py-3 font-medium">{t("columns.table")}</th>
                  <th className="px-5 py-3 font-medium">{t("columns.action")}</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">
                    {t("columns.user")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {allEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-foreground/5 last:border-0">
                    <td className="px-5 py-4 text-foreground/70">
                      {new Date(entry.changed_at).toLocaleString(dateLocale)}
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">{entry.table_name}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          actionStyles[entry.action],
                        )}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 text-foreground/60 sm:table-cell">
                      {entry.changed_by
                        ? (nameMap.get(entry.changed_by) ?? t("unknownUser"))
                        : t("systemUser")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </Container>
    </Section>
  );
}
