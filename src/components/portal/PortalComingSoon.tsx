import { Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function PortalComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <Section>
      <Container className="max-w-xl text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
          <Clock size={22} />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-3 text-foreground/60">{body}</p>
      </Container>
    </Section>
  );
}
