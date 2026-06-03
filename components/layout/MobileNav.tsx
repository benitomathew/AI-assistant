'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Mobile bottom nav — only shows on small screens
const navItems = [
  { href: '/assistant', label: 'CHAT', icon: '◈' },
  { href: '/memory', label: 'MEMORY', icon: '◉' },
  { href: '/settings', label: 'CONFIG', icon: '◎' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        background: 'rgba(4, 8, 16, 0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,212,255,0.1)',
      }}
    >
      {navItems.map(item => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center py-3 gap-1 transition-all"
            style={{
              color: isActive ? '#00d4ff' : '#2a4060',
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span className="font-mono text-[9px] tracking-widest">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
