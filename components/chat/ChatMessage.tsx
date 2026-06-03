'use client'

import { format } from 'date-fns'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: string | Date
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const time = message.createdAt
    ? format(new Date(message.createdAt), 'HH:mm')
    : ''

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 group`}>
      <div style={{ maxWidth: '75%', minWidth: '80px' }}>
        {/* Role label */}
        <div
          className={`flex items-center gap-2 mb-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
          {!isUser && (
            <div
              className="w-5 h-5 rounded flex items-center justify-center font-display font-bold text-xs"
              style={{
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.3)',
                color: '#00d4ff',
              }}
            >
              J
            </div>
          )}
          <span
            className="font-mono text-[10px] tracking-widest"
            style={{ color: '#2a4060' }}
          >
            {isUser ? 'YOU' : 'JARVIS'}
          </span>
          {time && (
            <span className="font-mono text-[10px]" style={{ color: '#2a4060' }}>
              {time}
            </span>
          )}
        </div>

        {/* Message bubble */}
        <div
          className={`px-5 py-3.5 ${isUser ? 'message-user' : 'message-assistant'}`}
          style={{ lineHeight: 1.7, fontSize: '0.92rem', color: '#e0f0ff' }}
        >
          {/* Format content - handle newlines */}
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
