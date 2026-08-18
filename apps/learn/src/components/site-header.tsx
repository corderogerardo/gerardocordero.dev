'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Brain, Code2, Globe, Layers, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: Brain },
  { href: '/en/learn/ios', label: 'Courses', icon: BookOpen },
  { href: '/practice', label: 'Practice', icon: Code2 },
];

const reactNativeItems = [
  { href: '/practice/reactnative', label: 'Flashcards', icon: Layers },
  { href: '/practice/reactnative/challenges', label: 'Challenges', icon: Code2 },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const isReactNativePractice = pathname.startsWith('/practice/reactnative');
  const visibleItems = isReactNativePractice ? [...navItems, ...reactNativeItems] : navItems;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/practice') {
      return pathname === '/practice' || (pathname.startsWith('/practice/') && !isReactNativePractice);
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-tight">{t("app.title")}</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border bg-card p-1 md:flex">
          {visibleItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full border border-border bg-card p-0.5 sm:flex">
          {['en', 'es'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLocale(lang as 'en' | 'es')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                locale === lang
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === 'en' ? 'EN' : 'ES'}</span>
            </button>
          ))}
          </div>
          <button
            type="button"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <nav className="mx-auto grid max-w-6xl gap-1">
            {visibleItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 flex gap-1 border-t border-border pt-3 sm:hidden">
              {['en', 'es'].map((lang) => (
                <button key={lang} type="button" onClick={() => setLocale(lang as 'en' | 'es')} className={cn('rounded-lg px-3 py-2 text-xs font-semibold', locale === lang ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground')}>
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
