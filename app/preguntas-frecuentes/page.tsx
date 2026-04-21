import type { Metadata } from "next";
import FAQPageClient from "./page.client";
import { canonicalUrl, ogImageUrl, SITE_NAME } from "@/shared/configs/seo";

export const metadata: Metadata = {
  title: `Preguntas Frecuentes | ${SITE_NAME}`,
  description:
    "Respuestas sobre compras, envíos, cambios, calidad de prendas y cómo vender con FENI Circular.",
  keywords: [
    "preguntas frecuentes feni",
    "faq ropa infantil circular",
    "envíos ropa infantil usada",
    "cambios y devoluciones ropa infantil",
    "vender ropa infantil usada",
  ],
  alternates: {
    canonical: canonicalUrl("/preguntas-frecuentes"),
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: canonicalUrl("/preguntas-frecuentes"),
    title: `Preguntas Frecuentes | ${SITE_NAME}`,
    description:
      "Todo lo que necesitás saber antes de comprar o vender en FENI Circular.",
    images: [
      {
        url: ogImageUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Preguntas Frecuentes`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Preguntas Frecuentes | ${SITE_NAME}`,
    description:
      "Consultá envíos, pagos, cambios, calidad de prendas y más en FENI Circular.",
    images: [ogImageUrl("/opengraph-image")],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FAQPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo compro en FENI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: 'Elegí los productos, agregalos al carrito y hacé clic en "Pedir por WhatsApp" para coordinar pago y envío.',
        },
      },
      {
        "@type": "Question",
        name: "¿Hacen envíos a todo el país?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, enviamos a todo Argentina con correo según destino y peso.",
        },
      },
      {
        "@type": "Question",
        name: "¿Las medidas son exactas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, medimos cada prenda sobre superficie plana y publicamos medidas reales en centímetros.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <FAQPageClient />
    </>
  );
}
