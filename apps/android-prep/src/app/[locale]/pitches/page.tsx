import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { Pitches } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getPitches, getPitchesIntroHtml } from "@/lib/locale-data";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Pitches de Práctica", description: "Diez respuestas habladas — presentaciones, “por qué Android”, una inmersión técnica e historias STAR — con un teleprompter para ensayar en cámara." }
    : { title: "Practice Pitches", description: "Ten spoken answers — intros, “why Android”, a technical deep-dive, and STAR stories — with a teleprompter to rehearse on camera." };
}

export default async function PitchesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Dilo en voz alta" : "Say it out loud"}
        title={locale === "es" ? "Pitches de Práctica" : "Practice Pitches"}
        lead={locale === "es"
          ? "Diez respuestas orales que cubren todo el rango de la entrevista. Toca ▶ Teleprompter en cualquier pitch para ensayar con una cámara, guión que se desplaza, temporizador y control de velocidad."
          : "Ten spoken answers covering the full interview range. Tap ▶ Teleprompter on any pitch to rehearse on camera with a scrolling script, timer, and speed control."}
      />
      <Pitches pitches={getPitches(locale as Locale)} introHtml={getPitchesIntroHtml(locale as Locale)} />
    </div>
  );
}
