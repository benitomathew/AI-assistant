'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ChatMessage from '@/components/chat/ChatMessage'
import Waveform from '@/components/voice/Waveform'
import { useVoice } from '@/components/voice/useVoice'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  title: string
  updatedAt: string
  messages: Message[]
}

// Orb visual - the central AI visualization
function JarvisOrb({
  state,
}: {
  state: 'idle' | 'listening' | 'thinking' | 'speaking'
}) {
  const colors = {
    idle: { primary: '#00d4ff', secondary: '#0066ff', opacity: 0.3 },
    listening: { primary: '#00d4ff', secondary: '#00ff88', opacity: 0.6 },
    thinking: { primary: '#0066ff', secondary: '#ff6600', opacity: 0.5 },
    speaking: { primary: '#00ff88', secondary: '#00d4ff', opacity: 0.7 },
  }
  const c = colors[state]

  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      {/* Outer pulse rings */}
      {state !== 'idle' && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: 80,
              height: 80,
              border: `1px solid ${c.primary}`,
              opacity: 0.3,
              animation: 'pulse-ring 2s ease-out infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 80,
              height: 80,
              border: `1px solid ${c.primary}`,
              opacity: 0.2,
              animation: 'pulse-ring 2s ease-out infinite 0.5s',
            }}
          />
        </>
      )}
      {/* Core orb */}
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          background: `radial-gradient(circle at 35% 35%, ${c.secondary}33, ${c.primary}22 50%, transparent 70%)`,
          border: `1px solid ${c.primary}${Math.round(c.opacity * 255).toString(16).padStart(2, '0')}`,
          boxShadow: `0 0 20px ${c.primary}${Math.round(c.opacity * 0.5 * 255).toString(16).padStart(2, '0')}, inset 0 0 20px ${c.primary}11`,
          transition: 'all 0.4s ease',
        }}
      >
        <span className="font-display font-bold text-base" style={{ color: c.primary }}>J</span>
      </div>
    </div>
  )
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isListening, isSpeaking, isSupported, startListening, stopListening, speak } = useVoice({
    onTranscript: (text) => {
      setInput(text)
      setTimeout(() => handleSend(text), 100)
    },
  })

  // Sync orb state
  useEffect(() => {
    if (isListening) setOrbState('listening')
    else if (isLoading) setOrbState('thinking')
    else if (isSpeaking) setOrbState('speaking')
    else setOrbState('idle')
  }, [isListening, isLoading, isSpeaking])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversations list
  useEffect(() => {
    fetch('/api/chat').then(r => r.json()).then(setConversations).catch(console.error)
  }, [])

  const handleSend = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || isLoading) return

    setInput('')
    const tempId = `temp-${Date.now()}`
    const userMsg: Message = {
      id: tempId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, conversationId }),
      })
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      const assistantMsg: Message = {
        id: data.messageId,
        role: 'assistant',
        content: data.message,
        createdAt: new Date().toISOString(),
      }

      setMessages(prev => [...prev, assistantMsg])
      if (!conversationId) setConversationId(data.conversationId)

      // Speak response if voice enabled
      if (voiceEnabled && isSupported) {
        speak(data.message)
      }
    } catch (err: any) {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message ?? 'Something went wrong'}`,
        createdAt: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, conversationId, voiceEnabled, isSupported, speak])

  const loadConversation = async (id: string) => {
    const msgs = await fetch(`/api/chat?conversationId=${id}`).then(r => r.json())
    setMessages(msgs)
    setConversationId(id)
    setShowHistory(false)
  }

  const newConversation = () => {
    setMessages([])
    setConversationId(null)
    setShowHistory(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleVoice = () => {
    if (isListening) stopListening()
    else if (voiceEnabled) startListening()
    setVoiceEnabled(v => !v)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Conversation history sidebar */}
      {showHistory && (
        <div
          className="w-72 flex-shrink-0 flex flex-col"
          style={{
            background: 'rgba(4, 8, 16, 0.95)',
            borderRight: '1px solid rgba(0,212,255,0.1)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}
          >
            <span className="font-mono text-xs tracking-widest" style={{ color: '#4a6080' }}>HISTORY</span>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs"
              style={{ color: '#4a6080' }}
            >
              ✕
            </button>
          </div>
          <button
            onClick={newConversation}
            className="mx-3 my-2 py-2 rounded-lg glow-btn text-xs font-mono tracking-widest"
          >
            + NEW CONVERSATION
          </button>
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm"
                style={{
                  background: conv.id === conversationId ? 'rgba(0,212,255,0.08)' : 'transparent',
                  border: `1px solid ${conv.id === conversationId ? 'rgba(0,212,255,0.2)' : 'transparent'}`,
                  color: conv.id === conversationId ? '#e0f0ff' : '#4a6080',
                }}
              >
                <div className="truncate">{conv.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHistory(v => !v)}
              className="glow-btn px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest"
            >
              ☰ HISTORY
            </button>
            <button
              onClick={newConversation}
              className="glow-btn px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest"
            >
              + NEW
            </button>
          </div>

          <div className="flex items-center gap-3">
            <JarvisOrb state={orbState} />
            <div>
              <div className="font-display font-bold tracking-widest" style={{ color: '#00d4ff' }}>
                JARVIS
              </div>
              <div className="font-mono text-xs" style={{ color: '#4a6080' }}>
                {orbState === 'idle' && 'STANDBY'}
                {orbState === 'listening' && '● LISTENING'}
                {orbState === 'thinking' && '◌ PROCESSING'}
                {orbState === 'speaking' && '▶ SPEAKING'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setVoiceEnabled(v => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest ${voiceEnabled ? 'glow-btn' : ''}`}
            style={!voiceEnabled ? { color: '#2a4060', border: '1px solid #2a4060' } : {}}
          >
            {voiceEnabled ? '🔊 VOICE ON' : '🔇 VOICE OFF'}
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-6">
                <JarvisOrb state="idle" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#e0f0ff' }}>
                How can I assist you?
              </h2>
              <p className="font-mono text-sm mb-8" style={{ color: '#2a4060' }}>
                Type a message or press the mic to speak
              </p>
              {/* Quick prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {[
                  "What are my current projects?",
                  "Summarize my goals",
                  "Remember: I prefer concise answers",
                  "What have we discussed before?",
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); handleSend(prompt) }}
                    className="glass-card px-4 py-3 text-left text-sm glow-hover"
                    style={{ color: '#4a6080' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-5">
              <div className="message-assistant px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs" style={{ color: '#4a6080' }}>JARVIS IS THINKING</span>
                  <Waveform isActive={true} mode="thinking" barCount={8} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          className="shrink-0 px-6 py-4"
          style={{ borderTop: '1px solid rgba(0,212,255,0.08)' }}
        >
          {/* Waveform display when active */}
          {(isListening || isSpeaking) && (
            <div className="flex items-center justify-center mb-3">
              <div
                className="flex items-center gap-4 px-6 py-2 rounded-full"
                style={{
                  background: 'rgba(0,212,255,0.06)',
                  border: '1px solid rgba(0,212,255,0.2)',
                }}
              >
                <span className="font-mono text-xs" style={{ color: '#00d4ff' }}>
                  {isListening ? '● LISTENING' : '▶ SPEAKING'}
                </span>
                <Waveform
                  isActive={true}
                  mode={isListening ? 'listening' : 'speaking'}
                  barCount={24}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Jarvis... (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="flex-1 jarvis-input rounded-xl px-5 py-3.5 resize-none font-mono text-sm"
              style={{ minHeight: '48px', maxHeight: '160px' }}
              onInput={e => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = `${Math.min(el.scrollHeight, 160)}px`
              }}
            />

            {/* Mic button */}
            {isSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: isListening
                    ? 'rgba(0,212,255,0.2)'
                    : 'rgba(0,212,255,0.06)',
                  border: `1px solid ${isListening ? '#00d4ff' : 'rgba(0,212,255,0.2)'}`,
                  boxShadow: isListening ? '0 0 20px rgba(0,212,255,0.3)' : 'none',
                  color: '#00d4ff',
                  fontSize: '18px',
                }}
              >
                {isListening ? '⏹' : '🎤'}
              </button>
            )}

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 glow-btn-primary transition-all"
              style={{
                opacity: !input.trim() || isLoading ? 0.4 : 1,
                cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
