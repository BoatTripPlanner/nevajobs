import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { RegisterServiceWorker } from "@/components/pwa/RegisterServiceWorker";
import { ScrollManager } from "@/components/scroll/ScrollManager";
import { ScrollToTop } from "@/components/scroll/ScrollToTop";
import { routing, type Locale } from "@/i18n/routing";
import { geistMono, geistSans } from "../layout";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0891b2" },
    { media: "(prefers-color-scheme: dark)", color: "#0e7490" },
  ],
};

export const metadata: Metadata = {
  applicationName: "Nevajobs",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nevajobs",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overscroll-y-none">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ScrollManager />
            {children}
            <ScrollToTop />
            <InstallPrompt />
          </AuthProvider>
        </NextIntlClientProvider>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
