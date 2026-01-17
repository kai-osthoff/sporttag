'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Users, Shuffle, FileText, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Start', icon: Home },
  { href: '/events', label: 'Veranstaltungen', icon: CalendarDays },
  { href: '/registrations', label: 'Anmeldungen', icon: Users },
  { href: '/allocation', label: 'Zuteilung', icon: Shuffle },
  { href: '/output', label: 'Listen', icon: FileText },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <header className="border-b print:hidden">
      <div className="container mx-auto flex h-14 items-center gap-6 px-4">
        <Link href="/" className="font-semibold">
          Sporttag
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
                  isActive ? 'bg-muted text-foreground' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
