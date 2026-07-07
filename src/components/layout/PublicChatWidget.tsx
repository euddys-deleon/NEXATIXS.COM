"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function PublicChatWidget() {
  const t = useTranslations("PublicChat");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (res.status === 503) {
        setError(t("notConfigured"));
        return;
      }
      if (!res.ok) {
        setError(t("genericError"));
        return;
      }

      const data = await res.json();
      setMessages([...nextMessages, { role: "assistant", content: data.reply as string }]);
    } catch {
      setError(t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex h-[480px] w-[340px] flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
              <span className="font-heading text-sm font-semibold text-foreground">
                {t("title")}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="text-foreground/60 hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <p className="max-w-[85%] rounded-xl bg-foreground/5 px-3 py-2 text-sm text-foreground">
                {t("greeting")}
              </p>
              {messages.map((message, index) => (
                <p
                  key={index}
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    message.role === "user"
                      ? "ml-auto bg-brand-blue text-white"
                      : "bg-foreground/5 text-foreground",
                  )}
                >
                  {message.content}
                </p>
              ))}
              {loading && (
                <p className="max-w-[85%] rounded-xl bg-foreground/5 px-3 py-2 text-sm text-foreground/60">
                  {t("thinking")}
                </p>
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-foreground/10 p-3"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("placeholder")}
                className="h-10 flex-1 rounded-full border border-foreground/15 bg-background px-3.5 text-sm text-foreground placeholder:text-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
              <button
                type="submit"
                aria-label={t("send")}
                disabled={loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white transition-colors hover:bg-brand-blue-dark disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("openLabel")}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
