import ReviewPageClient from "@/components/review-page-client";
import { LOCALES, COURSE_IDS } from "@/lib/i18n-config";

export function generateStaticParams() {
  const params: { locale: string; course: string }[] = [];
  for (const l of LOCALES) {
    for (const c of COURSE_IDS) {
      params.push({ locale: l.id, course: c });
    }
  }
  return params;
}

export default function ReviewPage() {
  return <ReviewPageClient />;
}
