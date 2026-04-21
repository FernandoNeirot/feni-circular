import type { Metadata } from "next";
import SellWithUsPageClient from "./page.client";
import { canonicalUrl, ogImageUrl, SITE_NAME } from "@/shared/configs/seo";

export const metadata: Metadata = {
  title: `Vendé con Nosotros | ${SITE_NAME}`,
  description:
    "Vendé o consigná ropa infantil en FENI Circular. Completá el formulario y coordinamos por WhatsApp.",
  keywords: [
    "vender ropa infantil",
    "consignar ropa infantil",
    "feni circular",
    "ropa infantil usada argentina",
  ],
  alternates: {
    canonical: canonicalUrl("/vende-con-nosotros"),
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: canonicalUrl("/vende-con-nosotros"),
    title: `Vendé con Nosotros | ${SITE_NAME}`,
    description:
      "Dale una segunda vida a la ropa infantil y ganá dinero vendiendo con FENI Circular.",
    images: [
      {
        url: ogImageUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Vendé con nosotros`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Vendé con Nosotros | ${SITE_NAME}`,
    description: "Vendé o consigná ropa infantil en FENI Circular.",
    images: [ogImageUrl("/opengraph-image")],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SellWithUsPage() {
  const sellPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Vendé con nosotros | FENI Circular",
    url: canonicalUrl("/vende-con-nosotros"),
    description:
      "Formulario para vender o consignar ropa infantil en FENI Circular.",
    about: {
      "@type": "Service",
      name: "Consignación de ropa infantil",
      provider: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      areaServed: "AR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sellPageJsonLd) }}
      />
      <SellWithUsPageClient />
    </>
  );
}
