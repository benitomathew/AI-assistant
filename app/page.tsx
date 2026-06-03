'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// Animated background orbs component
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Main glow orbs */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)',
          top: '-200px',
          right: '-100px',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-8"
        style={{
          background: 'radial-gradient(circle, #0066ff 0%, transparent 70%)',
          bottom: '-100px',
          left: '-100px',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'float 12s ease-in-out infinite',
        }}
      />
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-100" />
      {/* Scan line */}
      <div className="scan-line" />
    </div>
  )
}

// Animated waveform for hero
function HeroWaveform({ active }: { active: boolean }) {
  const bars = Array.from({ length: 32 })
  return (
    <div className="flex items-center gap-1 h-16">
      {bars.map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: '3px',
            background: active
              ? 'linear-gradient(to top, #00d4ff, #0066ff)'
              : 'rgba(0, 212, 255, 0.2)',
            boxShadow: active ? '0 0 6px #00d4ff' : 'none',
            height: active
              ? `${20 + Math.sin((i / bars.length) * Math.PI * 4) * 30 + Math.random() * 10}px`
              : '4px',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  )
}

// Feature card
function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="glass-card p-6 glow-hover group">
      <div className="text-3xl mb-4">{icon}</div>
      <h3
        className="font-display text-lg font-semibold mb-2"
        style={{ color: '#e0f0ff', letterSpacing: '0.05em' }}
      >
        {title}
      </h3>
      <p style={{ color: '#4a6080', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}

export default function LandingPage() {
  const [waveActive, setWaveActive] = useState(false)
  const [typedText, setTypedText] = useState('')
  const fullText = 'Your intelligent AI assistant'

  // Typewriter effect
  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, i))
      i++
      if (i > fullText.length) clearInterval(timer)
    }, 60)
    return () => clearInterval(timer)
  }, [])

  // Pulse waveform
  useEffect(() => {
    const timer = setInterval(() => setWaveActive(v => !v), 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="relative min-h-screen flex flex-col noise" style={{ background: '#020408' }}>
      <BackgroundOrbs />

      {/* Nav */}
      <nav
        className="relative z-10 flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,102,255,0.2))',
              border: '1px solid rgba(0,212,255,0.3)',
              boxShadow: '0 0 15px rgba(0,212,255,0.2)',
            }}
          >
            <span className="text-sm font-bold glow-text font-display">J</span>
          </div>
          <span className="font-display font-bold text-lg tracking-widest glow-text">JARVIS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/assistant" className="glow-btn px-5 py-2 rounded-lg text-sm font-medium font-display tracking-wide">
            LAUNCH
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24 md:py-36 flex-1">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-mono tracking-widest"
          style={{
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.2)',
            color: '#00d4ff',
          }}
        >
          <span className="status-dot" />
          SYSTEM ONLINE — v2.0
        </div>

        {/* Title */}
        <h1
          className="font-display text-6xl md:text-8xl font-bold mb-4"
          style={{
            letterSpacing: '0.15em',
            background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 50%, #0066ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
          }}
        >
          JARVIS
        </h1>

        {/* Subtitle typewriter */}
        <p
          className="text-xl md:text-2xl mb-3 font-light"
          style={{ color: '#8ab0c8', letterSpacing: '0.05em' }}
        >
          {typedText}
          <span className="animate-pulse" style={{ color: '#00d4ff' }}>|</span>
        </p>
        <p style={{ color: '#4a6080', maxWidth: '520px', lineHeight: 1.7 }} className="mb-12">
          Voice-activated AI with persistent memory. Remembers your preferences, projects, and goals.
          Available whenever you need it.
        </p>

        {/* Waveform display */}
        <div className="mb-12 corner-bracket px-8 py-4">
          <HeroWaveform active={waveActive} />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/assistant"
            className="glow-btn-primary px-8 py-3 rounded-xl font-display font-semibold text-sm tracking-widest"
          >
            OPEN ASSISTANT
          </Link>
          <Link
            href="/memory"
            className="glow-btn px-8 py-3 rounded-xl font-display font-semibold text-sm tracking-widest"
          >
            MEMORY VAULT
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <p
            className="font-mono text-xs tracking-[0.3em] mb-3"
            style={{ color: '#00d4ff' }}
          >
            CORE SYSTEMS
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: '#e0f0ff' }}>
            Built different.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon="🧠"
            title="Persistent Memory"
            desc="Remembers your preferences, ongoing projects, and goals across every conversation. Like a real assistant."
          />
          <FeatureCard
            icon="🎤"
            title="Voice Interface"
            desc="Speak naturally. Real-time speech recognition with visual waveform feedback and voice response."
          />
          <FeatureCard
            icon="⚡"
            title="LLM-Powered"
            desc="Powered by Claude — the most capable AI assistant. Intelligent responses with contextual memory injection."
          />
          <FeatureCard
            icon="🔒"
            title="Private & Local"
            desc="Your data stays in your own database. No data sharing, no tracking. Full control over your memories."
          />
          <FeatureCard
            icon="📊"
            title="Memory Manager"
            desc="View, organize, and edit your AI's memory. Categorize into preferences, projects, goals, and notes."
          />
          <FeatureCard
            icon="🎛️"
            title="Full Customization"
            desc="Personalize voice settings, assistant name, system prompts, and behavior to match your workflow."
          />
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 text-center py-8"
        style={{ borderTop: '1px solid rgba(0,212,255,0.06)', color: '#2a4060' }}
      >
        <span className="font-mono text-xs tracking-widest">JARVIS AI — PERSONAL INTELLIGENCE SYSTEM</span>
      </footer>
    </main>
  )
}
