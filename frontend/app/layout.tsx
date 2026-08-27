import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "Labyrinth SOC Dashboard",
  description: "AI-Powered RAG Honeypot & Threat Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex bg-[#070b10] text-[#e2e8f0]`}>
        
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-[#1c2a38] bg-[#0c1219] flex flex-col p-4">
          <div className="mb-8 flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold font-mono">L</div>
            <h1 className="text-xl font-bold font-mono text-white tracking-wider">LABYRINTH</h1>
          </div>
          <nav className="flex flex-col gap-2">
            <Link href="/" className="px-3 py-2 rounded hover:bg-[#111a24] text-sm text-gray-300 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/analytics" className="px-3 py-2 rounded hover:bg-[#111a24] text-sm text-gray-300 hover:text-white transition-colors">Analytics</Link>
            <Link href="/alerts" className="px-3 py-2 rounded hover:bg-[#111a24] text-sm text-gray-300 hover:text-white transition-colors">Alerts</Link>
            <Link href="/benchmark" className="px-3 py-2 rounded hover:bg-[#111a24] text-sm text-gray-300 hover:text-white transition-colors">Benchmark</Link>
            <Link href="/demo/deception" className="px-3 py-2 rounded hover:bg-[#111a24] text-sm text-gray-300 hover:text-white transition-colors">Deception Demo</Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6 relative">
          <div className="scanline"></div>
          <div className="max-w-6xl mx-auto z-10 relative">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
