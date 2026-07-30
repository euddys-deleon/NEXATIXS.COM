"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { hardNavigateTo } from "@/lib/auth/resolve-home";
import { supabase } from "@/lib/supabase/client";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

type CallbackError = "oauth_error" | "no_account";

export function LoginForm({ initialError }: { initialError?: CallbackError }) {
  const t = useTranslations("Login");
  const locale = useLocale();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError === "no_account"
      ? t("noAccountLinked")
      : initialError === "oauth_error"
        ? t("oauthError")
        : null,
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const result = (await response.json()) as { ok: boolean; error?: string; destination?: string };

    if (!result.ok || !result.destination) {
      setSubmitting(false);
      setError(
        result.error === "rate_limited"
          ? t("rateLimited")
          : result.error === "invalid_credentials"
            ? t("invalidCredentials")
            : t("genericError"),
      );
      return;
    }

    setSubmitting(false);
    hardNavigateTo(locale, result.destination);
  }

  async function handleGoogleLogin() {
    setGoogleSubmitting(true);
    setError(null);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // /api/auth/callback (not a locale-prefixed page) so proxy.ts's
        // next-intl middleware doesn't intercept it — the locale rides
        // along as a query param instead, see that route for details.
        redirectTo: `${window.location.origin}/api/auth/callback?locale=${locale}`,
      },
    });

    if (oauthError) {
      setGoogleSubmitting(false);
      setError(t("oauthError"));
    }
    // On success the browser navigates away to Google immediately, so no
    // further local state update is needed (or reachable) here.
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label={t("email")} htmlFor="identifier">
          <Input
            id="identifier"
            type="text"
            required
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
          />
        </Field>
        <Field label={t("password")} htmlFor="password">
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={submitting || googleSubmitting}>
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-foreground/10" />
        <span className="text-xs uppercase tracking-widest text-foreground/40">{t("orDivider")}</span>
        <div className="h-px flex-1 bg-foreground/10" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="mt-6 w-full"
        disabled={submitting || googleSubmitting}
        onClick={handleGoogleLogin}
      >
        <GoogleIcon className="h-5 w-5" />
        {googleSubmitting ? t("submitting") : t("continueWithGoogle")}
      </Button>

      <p className="mt-6 text-center text-sm text-foreground/60">
        {t("noAccount")}{" "}
        <Link href="/agendar-cita" className="font-medium text-brand-blue hover:underline">
          {t("requestAccess")}
        </Link>
      </p>
    </>
  );
}
