import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import QueryProvider from "@/components/providers/QueryProvider";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Cura",
  description: "AI-powered resume tailoring platform - Curate your career story for every opportunity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <QueryProvider>
          <Navigation />
          {children}
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}

