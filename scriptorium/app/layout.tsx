import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuroraBackground from "@/components/AuroraBackground";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700", "900"], variable: "--font-cinzel" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-cormorant" });

export const metadata: Metadata = {
  title: "Scriptorium — Seus Livros, Sua História",
  description: "O salão onde o autor inscreve suas histórias e você as lê capítulo a capítulo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={cinzel.variable + " " + cormorant.variable + " flex min-h-screen flex-col"}>
        <AuroraBackground />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}