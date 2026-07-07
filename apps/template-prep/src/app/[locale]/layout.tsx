import { I18nProvider, PrepProvider, SiteHeader, SiteFooter } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { prepConfig } from "@/prep.config";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <I18nProvider locale={locale as Locale}>
      <PrepProvider config={prepConfig}>
        <SiteHeader />
        <main className="mx-auto w-full max-w-content flex-1 px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
        <SiteFooter />
      </PrepProvider>
    </I18nProvider>
  );
}
