import type { Metadata, Viewport } from "next";
import { Geist, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthCheck } from "@/components/providers/AuthCheck";
import { SplashProvider } from "@/components/providers/SplashProvider";
import { Analytics } from "@vercel/analytics/next";
import { Cursor } from "@/components/ui/Cursor";

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
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
        <Cursor />
        <ThemeProvider>
          <ToastProvider>
            <SplashProvider>
              <AuthCheck>
                {children}
                <Analytics />
              </AuthCheck>
            </SplashProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
