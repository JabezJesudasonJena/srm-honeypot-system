import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Chatbot from "@/components/Chatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "Project Labyrinth | SOC Dashboard",
  description: "AI-Assisted Adaptive Honeypot / Deception Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased h-screen overflow-hidden flex bg-[var(--color-soc-bg)] text-[var(--color-soc-text)]`}>
        <div className="scanline"></div>
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-[var(--color-soc-bg)]">
            {children}
          </main>
        </div>
        <Chatbot />
      </body>
    </html>
  );
}
