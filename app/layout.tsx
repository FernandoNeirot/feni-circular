import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { Providers } from "@/shared/components/providers";
import { CartProvider } from "@/shared/components/cart-provider";
import { Header } from "@/shared/components/Header";
import { WhatsAppFloatButton } from "@/shared/components/WhatsAppFloatButton";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FENI - Ropa Infantil Circular",
  description: "Ropa infantil circular de excelente calidad. Segunda vida, calidad excepcional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${quicksand.variable} font-sans antialiased`}>
        <Providers>
          <CartProvider>
            <Header />
            {children}
            <WhatsAppFloatButton />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
