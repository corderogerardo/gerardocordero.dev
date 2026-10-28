import { HomePageClient } from '@/components/HomePageClient'

export default function Home({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'en';

  return (
    <HomePageClient
      locale={locale}
      courses={[]}
      specs={[]}
      totalLessons={0}
    />
  );
}
