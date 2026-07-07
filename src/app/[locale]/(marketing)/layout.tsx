import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicChatWidget } from "@/components/layout/PublicChatWidget";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <PublicChatWidget />
    </>
  );
}
