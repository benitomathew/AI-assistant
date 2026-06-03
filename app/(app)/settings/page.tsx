'use client'

import { useState, useEffect } from 'react'

interface Settings {
  id: string
  userName: string
  assistantName: string
  voiceEnabled: boolean
  voiceRate: number
  voicePitch: number
  voiceVolume: number
  selectedVoice: string
  autoSaveMemory: boolean
  theme: string
  systemPrompt: string
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6 mb-5">
      <h2
        className="font-mono text-xs tracking-[0.2em] mb-5"
        style={{ color: '#00d4ff', borderBottom: '1px solid rgba(0,212,255,0.1)', paddingBottom: '12px' }}
      >
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <div className="font-display font-medium text-sm mb-0.5" style={{ color: '#e0f0ff', letterSpacing: '0.04em' }}>
          {label}
        </div>
        {description && (
          <div className="text-xs" style={{ color: '#4a6080', lineHeight: 1.5 }}>
            {description}
          </div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-12 h-6 rounded-full transition-all"
      style={{
        background: checked ? 'rgba(0,212,255,0.2)' : 'rgba(0,212,255,0.06)',
        border: `1px solid ${checked ? 'rgba(0,212,255,0.5)' : 'rgba(0,212,255,0.15)'}`,
        boxShadow: checked ? '0 0 10px rgba(0,212,255,0.2)' : 'none',
      }}
    >
      <span
        className="absolute top-0.5 rounded-full transition-all"
        style={{
          width: '18px',
          height: '18px',
          left: checked ? '22px' : '2px',
          background: checked ? '#00d4ff' : '#4a6080',
          boxShadow: checked ? '0 0 8px #00d4ff' : 'none',
        }}
      />
    </button>
  )
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  label,
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  label?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-28"
        style={{ accentColor: '#00d4ff' }}
      />
      <span className="font-mono text-xs w-8 text-right" style={{ color: '#00d4ff' }}>
        {value.toFixed(1)}
      </span>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings)
    // Load available voices
    const loadVoices = () => setVoices(window.speechSynthesis?.getVoices() ?? [])
    loadVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const update = (key: keyof Settings, value: any) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null)
  }

  const save = async () => {
    if (!settings) return
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="w-8 h-8 rounded-full ring-spin"
          style={{ border: '2px solid rgba(0,212,255,0.1)', borderTop: '2px solid #00d4ff' }}
        />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs tracking-[0.3em] mb-1" style={{ color: '#00d4ff' }}>
          SYSTEM ◎ CONFIGURATION
        </p>
        <h1 className="font-display text-3xl font-bold" style={{ color: '#e0f0ff', letterSpacing: '0.1em' }}>
          Settings
        </h1>
      </div>

      {/* Identity */}
      <SettingSection title="◈ IDENTITY">
        <SettingRow label="Your Name" description="How Jarvis will address you">
          <input
            className="jarvis-input rounded-xl px-4 py-2 text-sm w-48"
            value={settings.userName}
            onChange={e => update('userName', e.target.value)}
            placeholder="Your name..."
          />
        </SettingRow>
        <SettingRow label="Assistant Name" description="Name for your AI assistant">
          <input
            className="jarvis-input rounded-xl px-4 py-2 text-sm w-48"
            value={settings.assistantName}
            onChange={e => update('assistantName', e.target.value)}
            placeholder="Assistant name..."
          />
        </SettingRow>
      </SettingSection>

      {/* Voice */}
      <SettingSection title="🎤 VOICE SETTINGS">
        <SettingRow label="Voice Output" description="Enable text-to-speech responses">
          <Toggle checked={settings.voiceEnabled} onChange={v => update('voiceEnabled', v)} />
        </SettingRow>
        <SettingRow label="Speech Rate" description="Speed of spoken responses">
          <Slider
            value={settings.voiceRate}
            min={0.5}
            max={2}
            step={0.1}
            onChange={v => update('voiceRate', v)}
          />
        </SettingRow>
        <SettingRow label="Pitch" description="Voice pitch level">
          <Slider
            value={settings.voicePitch}
            min={0.5}
            max={2}
            step={0.1}
            onChange={v => update('voicePitch', v)}
          />
        </SettingRow>
        <SettingRow label="Volume" description="Voice output volume">
          <Slider
            value={settings.voiceVolume}
            min={0}
            max={1}
            step={0.1}
            onChange={v => update('voiceVolume', v)}
          />
        </SettingRow>
        {voices.length > 0 && (
          <SettingRow label="Voice" description="Select a TTS voice">
            <select
              className="jarvis-input rounded-xl px-3 py-2 text-sm w-48"
              value={settings.selectedVoice}
              onChange={e => update('selectedVoice', e.target.value)}
            >
              <option value="">Default</option>
              {voices.map(v => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </SettingRow>
        )}
      </SettingSection>

      {/* Memory */}
      <SettingSection title="🧠 MEMORY SETTINGS">
        <SettingRow
          label="Auto-Save Memories"
          description="Automatically extract and save information from conversations"
        >
          <Toggle
            checked={settings.autoSaveMemory}
            onChange={v => update('autoSaveMemory', v)}
          />
        </SettingRow>
      </SettingSection>

      {/* AI System Prompt */}
      <SettingSection title="⚡ AI CONFIGURATION">
        <SettingRow
          label="System Prompt"
          description="Base instructions that shape how your assistant behaves"
        >
          <div />
        </SettingRow>
        <textarea
          className="w-full jarvis-input rounded-xl px-4 py-3 text-sm font-mono resize-none"
          value={settings.systemPrompt}
          onChange={e => update('systemPrompt', e.target.value)}
          rows={5}
          placeholder="You are Jarvis, an advanced AI personal assistant..."
        />
      </SettingSection>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={save}
          className="glow-btn-primary px-8 py-3 rounded-xl font-mono text-xs tracking-widest transition-all"
          style={{
            background: isSaved ? 'rgba(0,255,136,0.15)' : undefined,
            borderColor: isSaved ? 'rgba(0,255,136,0.4)' : undefined,
            color: isSaved ? '#00ff88' : undefined,
          }}
        >
          {isSaved ? '✓ SAVED' : 'SAVE SETTINGS'}
        </button>
      </div>

      {/* Danger zone */}
      <div
        className="mt-8 p-6 rounded-xl"
        style={{
          background: 'rgba(255,0,80,0.04)',
          border: '1px solid rgba(255,0,80,0.15)',
        }}
      >
        <h2 className="font-mono text-xs tracking-widest mb-4" style={{ color: '#ff3366' }}>
          ⚠ DANGER ZONE
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-sm font-medium mb-1" style={{ color: '#e0f0ff' }}>
              Clear All Memories
            </div>
            <div className="text-xs" style={{ color: '#4a6080' }}>
              Permanently delete all saved memories. This cannot be undone.
            </div>
          </div>
          <button
            onClick={async () => {
              if (!confirm('Delete ALL memories? This cannot be undone.')) return
              const all = await fetch('/api/memories').then(r => r.json())
              await Promise.all(
                all.map((m: any) => fetch(`/api/memories?id=${m.id}`, { method: 'DELETE' }))
              )
              alert('All memories cleared.')
            }}
            className="px-4 py-2 rounded-lg font-mono text-xs"
            style={{
              background: 'rgba(255,0,80,0.08)',
              border: '1px solid rgba(255,0,80,0.2)',
              color: '#ff3366',
            }}
          >
            CLEAR MEMORY
          </button>
        </div>
      </div>
    </div>
  )
}
