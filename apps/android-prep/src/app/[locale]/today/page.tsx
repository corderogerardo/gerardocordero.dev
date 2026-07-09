import type { Metadata } from "next";
import { PageHeader, DailySession } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getFlashcards, getPrompts } from "@/lib/locale-data";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Hoy", description: "Tu práctica diaria — las tarjetas pendientes más un prompt de código y uno de diseño de sistemas, con una racha." }
    : { title: "Today", description: "Your daily drill — the flashcards that are due plus one coding and one system-design prompt, with a streak to keep you honest." };
}

export default async function TodayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Práctica diaria" : "Daily drill"}
        title={locale === "es" ? "Sesión de Hoy" : "Today's Session"}
        lead={locale === "es"
          ? "El bucle de 20 minutos, ensamblado para ti: las tarjetas que la repetición espaciada dice que estás a punto de olvidar, más un prompt de código y uno de diseño de sistema. Termínalo cada día y mantén la racha viva."
          : "The 20-minute loop, assembled for you: the cards spaced repetition says you're about to forget, plus a coding and a system-design prompt. Finish it daily and keep the streak alive."}
      />
      <DailySession flashcards={getFlashcards(locale as Locale)} prompts={getPrompts(locale as Locale)} />
    </div>
  );
}
