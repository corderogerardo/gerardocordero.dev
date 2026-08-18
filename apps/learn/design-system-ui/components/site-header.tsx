'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layers, Code2, Globe, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/reactnative', label: 'Flashcards', icon: Layers },
  { href: '/reactnative/challenges', label: 'Challenges', icon: Code2 },
  // Courses and Quiz routes will be added when routes are implemented
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/reactnative"
          className="flex items-center gap-2.5"
          aria-label="PawWalk Academy"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            <Code2 className="h-4.5 w-4.5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            PawWalk Academy
          </span>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {navItems.map((item) => {
            const active =
              item.href === '/reactnative'
                ? pathname === '/reactnative'
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
          {/* TODO: Add Courses and Quiz nav items when routes are implemented */}
        </nav>
      </div>
    </header>
  )
}
