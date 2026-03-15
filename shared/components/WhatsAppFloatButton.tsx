"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useContext } from "react";
import { WhatsAppVisibilityContext } from "@/shared/components/WhatsAppVisibilityContext";

const WHATSAPP_NUMBER = "541133150864";
const BASE_MESSAGE = "Hola, queria hacerte unas consultas por las prendas de Feni";

const FALLBACK_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(BASE_MESSAGE)}`;

export function WhatsAppFloatButton() {
  const pathname = usePathname();
  const visibility = useContext(WhatsAppVisibilityContext);
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const shouldHide =
    visibility?.shouldHideButton(isAdmin) ?? isAdmin;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const message = `${BASE_MESSAGE}\n\n${typeof window !== "undefined" ? window.location.origin : ""}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (shouldHide) return null;

  return (
    <a
      href={FALLBACK_HREF}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fixed right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bottom-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))] bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/50"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={2} />
    </a>
  );
}
