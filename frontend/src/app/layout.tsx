import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopAppBar from "@/components/TopAppBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DOPS Dashboard",
  description: "Distributed Order Processing System Command Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-body-md text-body-md h-screen w-screen overflow-hidden flex flex-col relative antialiased`}>
        <div className="flex flex-1 overflow-hidden w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col w-full md:ml-[240px] max-w-full md:max-w-[calc(100vw-240px)]">
            <TopAppBar />
            <main className="flex-1 overflow-y-auto bg-surface-container-lowest canvas-grid p-margin-md relative">
              <div className="max-w-[container-max-width] mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
