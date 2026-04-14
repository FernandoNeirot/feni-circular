import type { Metadata } from "next";
import Pageclient from "./page.client";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  LOCALE,
  TWITTER_HANDLE,
  canonicalUrl,
  ogImageUrl,
} from "@/shared/configs/seo";

const OG_IMAGE = "/images/feni-logo.png";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Ropa Infantil Circular`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  alternates: {
    canonical: canonicalUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: LOCALE,
    url: canonicalUrl("/"),
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Ropa Infantil Circular`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: ogImageUrl(OG_IMAGE),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Ropa Infantil Circular`,
    description: SITE_DESCRIPTION,
    images: [ogImageUrl(OG_IMAGE)],
    creator: TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const testimonials = [
  {
    name: "Carolina M.",
    text: "Compré un abrigo Mimo a mitad de precio y llegó impecable. ¡Parecía nuevo!",
    rating: 5,
  },
  {
    name: "Lucía P.",
    text: "Las medidas reales son un golazo. Por fin no me equivoco de talle comprando online.",
    rating: 5,
  },
  {
    name: "Martina G.",
    text: "Ya compré 3 veces. La ropa llega limpia, bien empaquetada y siempre como la describe.",
    rating: 5,
  },
];

export default async function Home() {
  const homeUrl = canonicalUrl("/");
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${SITE_NAME} - Ropa Infantil Circular`,
    description: SITE_DESCRIPTION,
    url: homeUrl,
    inLanguage: LOCALE,
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-muted/30 to-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      <main>
        <Pageclient testimonials={testimonials} />
      </main>
    </div>
  );
}
