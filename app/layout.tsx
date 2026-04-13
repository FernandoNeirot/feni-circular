import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { Providers } from "@/shared/components/providers";
import { CartProvider } from "@/shared/components/cart-provider";
import { FavoritesProvider } from "@/shared/components/favorites-provider";
import { SyncSoldOutFavorites } from "@/shared/components/SyncSoldOutFavorites";
import { Header } from "@/shared/components/Header";
import { WhatsAppFloatButton } from "@/shared/components/WhatsAppFloatButton";
import { WhatsAppVisibilityProvider } from "@/shared/components/WhatsAppVisibilityContext";
import { ScrollToTop } from "@/shared/components/ScrollToTop";
import { Analytics } from "@vercel/analytics/next"

/** Una sola fuente variable (menos solicitudes bloqueantes que 4 pesos estáticos). */
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  adjustFontFallback: true,
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://fenicircular.com";
const mainNavLinks = [
  { name: "Inicio", url: `${baseUrl}/` },
  { name: "Productos", url: `${baseUrl}/buscar` },
  { name: "Cómo funciona", url: `${baseUrl}/como-funciona-feni` },
  { name: "Vendé con nosotros", url: `${baseUrl}/vende-con-nosotros` },
  { name: "Preguntas frecuentes", url: `${baseUrl}/preguntas-frecuentes` },
];

export const metadata: Metadata = {
  title: "Feni Circular - Ropa Infantil Usada de Calidad | Compra y Vende",
  description:
    "Ropa infantil usada de excelente calidad. Compra ropa de segunda mano para niñas y niños. Vende o consigna ropa infantil en Feni Circular. Envíos con Correo Argentino.",
  keywords: [
    "ropa infantil usada",
    "ropa infantil segunda mano",
    "ropa niños usado",
    "ropa infantil circular",
    "economía circular",
    "ropa infantil sostenible",
    "consignación ropa infantil",
    "vender ropa infantil",
    "ropa usada Argentina",
    "CABA",
    "feni circular",
  ],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: baseUrl,
    title: "Feni Circular - Ropa Infantil Usada de Calidad",
    description:
      "Plataforma de venta de ropa infantil usada. Segunda vida, calidad excepcional. Compra y vende con nosotros.",
    siteName: "Feni Circular",
    images: [
      {
        url: `${baseUrl}/images/feni-logo.png`,
        width: 1200,
        height: 630,
        alt: "Feni Circular - Ropa Infantil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Feni Circular - Ropa Infantil Usada",
    description: "Ropa infantil circular de excelente calidad.",
    images: [`${baseUrl}/images/feni-logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png", sizes: "48x48" }],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#1e40af" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Feni Circular" />
        <meta name="google-site-verification" content="agregar-tu-google-verification" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link
          rel="preconnect"
          href="https://firebasestorage.googleapis.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${quicksand.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Feni Circular",
              url: baseUrl,
              logo: `${baseUrl}/images/feni-logo.png`,
              description: "Plataforma de venta de ropa infantil usada de excelente calidad.",
              sameAs: ["https://wa.me/541133150864"],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Service",
                telephone: "+54-11-3315-0864",
              },
              areaServed: {
                "@type": "Country",
                name: "AR",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "WebSite",
              name: "Feni Circular",
              url: baseUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${baseUrl}/buscar?q={search_term_string}`,
                },
                query_input: "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: mainNavLinks.map((item, index) => ({
                "@type": "SiteNavigationElement",
                position: index + 1,
                name: item.name,
                url: item.url,
              })),
            }),
          }}
        />
        <Analytics />
        <Providers>
          <ScrollToTop />
          <CartProvider>
            <FavoritesProvider>
              <SyncSoldOutFavorites />
              <WhatsAppVisibilityProvider>
                <Header />
                {children}
                <WhatsAppFloatButton />
              </WhatsAppVisibilityProvider>
            </FavoritesProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
