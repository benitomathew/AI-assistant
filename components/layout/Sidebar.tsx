'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/assistant', label: 'ASSISTANT', icon: '◈' },
  { href: '/memory', label: 'MEMORY', icon: '◉' },
  { href: '/settings', label: 'SETTINGS', icon: '◎' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 h-full z-50 flex flex-col"
      style={{
        width: '220px',
        background: 'rgba(4, 8, 16, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0,212,255,0.1)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,102,255,0.15))',
            border: '1px solid rgba(0,212,255,0.3)',
            boxShadow: '0 0 12px rgba(0,212,255,0.15)',
          }}
        >
          <span className="font-display font-bold glow-text text-sm">J</span>
        </div>
        <div>
          <div className="font-display font-bold tracking-widest glow-text text-base">JARVIS</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="status-dot" style={{ width: 5, height: 5 }} />
            <span className="font-mono text-[9px] tracking-widest" style={{ color: '#00ff88' }}>ONLINE</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p
          className="font-mono text-[9px] tracking-[0.25em] px-3 mb-3"
          style={{ color: '#2a4060' }}
        >
          NAVIGATION
        </p>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname.startsWith(item.href) ? 'active' : ''}`}
          >
            <span className="text-base" style={{ fontFamily: 'monospace' }}>{item.icon}</span>
            <span className="font-mono text-xs tracking-widest">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Back to home */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(0,212,255,0.06)' }}>
        <Link href="/" className="sidebar-link">
          <span className="text-base">←</span>
          <span className="font-mono text-xs tracking-widest">HOME</span>
        </Link>
      </div>
    </aside>
  )
}
