import type { Metadata, Viewport } from "next";
import { Geist, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthCheck } from "@/components/providers/AuthCheck";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contro - Content Operating System",
  description: "A local-first, offline-capable Content Operating System for writing, storing, and organizing content.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${sourceSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-body">
        <ThemeProvider>
          <ToastProvider>
            <AuthCheck>
              {children}
              <Analytics />
            </AuthCheck>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
