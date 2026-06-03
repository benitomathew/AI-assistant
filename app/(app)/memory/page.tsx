'use client'

import { useState, useEffect } from 'react'

type Category = 'preferences' | 'projects' | 'goals' | 'general'

interface Memory {
  id: string
  category: Category
  title: string
  content: string
  tags: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

const CATEGORIES: { key: Category; label: string; icon: string; color: string }[] = [
  { key: 'preferences', label: 'PREFERENCES', icon: '◈', color: '#00d4ff' },
  { key: 'projects', label: 'PROJECTS', icon: '◉', color: '#0066ff' },
  { key: 'goals', label: 'GOALS', icon: '◎', color: '#00ff88' },
  { key: 'general', label: 'GENERAL', icon: '◇', color: '#ff9900' },
]

function MemoryCard({
  memory,
  onEdit,
  onDelete,
  onPin,
}: {
  memory: Memory
  onEdit: (m: Memory) => void
  onDelete: (id: string) => void
  onPin: (id: string, pinned: boolean) => void
}) {
  const cat = CATEGORIES.find(c => c.key === memory.category)
  const tags = memory.tags ? memory.tags.split(',').filter(Boolean) : []

  return (
    <div
      className="glass-card p-5 glow-hover group relative"
      style={{
        borderColor: memory.isPinned ? `${cat?.color}33` : undefined,
      }}
    >
      {memory.isPinned && (
        <div
          className="absolute top-3 right-3 text-xs font-mono"
          style={{ color: cat?.color }}
        >
          📌
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: cat?.color, fontSize: '12px' }}>{cat?.icon}</span>
            <span
              className="font-mono text-[10px] tracking-widest"
              style={{ color: cat?.color }}
            >
              {cat?.label}
            </span>
          </div>
          <h3
            className="font-display font-semibold text-base"
            style={{ color: '#e0f0ff', letterSpacing: '0.03em' }}
          >
            {memory.title}
          </h3>
        </div>
      </div>

      <p className="text-sm mb-4" style={{ color: '#8ab0c8', lineHeight: 1.6 }}>
        {memory.content}
      </p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded font-mono text-[10px]"
              style={{
                background: 'rgba(0,212,255,0.06)',
                border: '1px solid rgba(0,212,255,0.15)',
                color: '#4a6080',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div
        className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ borderTop: '1px solid rgba(0,212,255,0.08)', paddingTop: '12px', marginTop: '4px' }}
      >
        <span className="font-mono text-[10px]" style={{ color: '#2a4060' }}>
          {new Date(memory.updatedAt).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPin(memory.id, !memory.isPinned)}
            className="px-2.5 py-1 rounded text-xs font-mono glow-btn"
            title={memory.isPinned ? 'Unpin' : 'Pin'}
          >
            {memory.isPinned ? 'UNPIN' : 'PIN'}
          </button>
          <button
            onClick={() => onEdit(memory)}
            className="px-2.5 py-1 rounded text-xs font-mono glow-btn"
          >
            EDIT
          </button>
          <button
            onClick={() => onDelete(memory.id)}
            className="px-2.5 py-1 rounded text-xs font-mono"
            style={{
              background: 'rgba(255,0,80,0.08)',
              border: '1px solid rgba(255,0,80,0.2)',
              color: '#ff3366',
            }}
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  )
}

function MemoryModal({
  memory,
  onClose,
  onSave,
}: {
  memory: Memory | null
  onClose: () => void
  onSave: (data: Partial<Memory>) => void
}) {
  const [form, setForm] = useState<Partial<Memory>>(
    memory ?? { category: 'general', title: '', content: '', tags: '', isPinned: false }
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-strong rounded-2xl p-8 w-full max-w-lg corner-bracket">
        <h2 className="font-display text-xl font-bold mb-6" style={{ color: '#00d4ff', letterSpacing: '0.08em' }}>
          {memory ? 'EDIT MEMORY' : 'NEW MEMORY'}
        </h2>

        <div className="space-y-4">
          {/* Category */}
          <div>
            <label className="font-mono text-xs tracking-widest block mb-2" style={{ color: '#4a6080' }}>
              CATEGORY
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setForm(f => ({ ...f, category: cat.key }))}
                  className="py-2 px-3 rounded-lg text-xs font-mono tracking-widest transition-all"
                  style={{
                    background: form.category === cat.key ? `${cat.color}15` : 'rgba(0,212,255,0.04)',
                    border: `1px solid ${form.category === cat.key ? cat.color + '50' : 'rgba(0,212,255,0.1)'}`,
                    color: form.category === cat.key ? cat.color : '#4a6080',
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-mono text-xs tracking-widest block mb-2" style={{ color: '#4a6080' }}>TITLE</label>
            <input
              className="w-full jarvis-input rounded-xl px-4 py-3 text-sm"
              value={form.title ?? ''}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Memory title..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="font-mono text-xs tracking-widest block mb-2" style={{ color: '#4a6080' }}>CONTENT</label>
            <textarea
              className="w-full jarvis-input rounded-xl px-4 py-3 text-sm resize-none"
              value={form.content ?? ''}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Memory content..."
              rows={4}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="font-mono text-xs tracking-widest block mb-2" style={{ color: '#4a6080' }}>TAGS (comma-separated)</label>
            <input
              className="w-full jarvis-input rounded-xl px-4 py-3 text-sm"
              value={form.tags ?? ''}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="work, personal, important..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => onSave(form)}
            className="flex-1 glow-btn-primary py-3 rounded-xl font-mono text-xs tracking-widest"
          >
            SAVE MEMORY
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-mono text-xs tracking-widest"
            style={{ border: '1px solid rgba(0,212,255,0.15)', color: '#4a6080' }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [editingMemory, setEditingMemory] = useState<Memory | null | 'new'>('new' as any)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMemories = async () => {
    setIsLoading(true)
    const params = activeCategory !== 'all' ? `?category=${activeCategory}` : ''
    const data = await fetch(`/api/memories${params}`).then(r => r.json())
    setMemories(data)
    setIsLoading(false)
  }

  useEffect(() => { fetchMemories() }, [activeCategory])

  const handleSave = async (data: Partial<Memory>) => {
    const isEdit = editingMemory && editingMemory !== 'new' && 'id' in (editingMemory as Memory)

    if (isEdit) {
      await fetch('/api/memories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(editingMemory as Memory), ...data }),
      })
    } else {
      await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }

    setShowModal(false)
    setEditingMemory(null)
    fetchMemories()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory? This cannot be undone.')) return
    await fetch(`/api/memories?id=${id}`, { method: 'DELETE' })
    fetchMemories()
  }

  const handlePin = async (id: string, isPinned: boolean) => {
    await fetch('/api/memories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isPinned }),
    })
    fetchMemories()
  }

  const filtered = activeCategory === 'all'
    ? memories
    : memories.filter(m => m.category === activeCategory)

  return (
    <div className="p-8 h-screen overflow-y-auto">
      {showModal && (
        <MemoryModal
          memory={editingMemory && editingMemory !== 'new' ? editingMemory as Memory : null}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] mb-1" style={{ color: '#00d4ff' }}>
            SYSTEM ◈ MEMORY VAULT
          </p>
          <h1 className="font-display text-3xl font-bold" style={{ color: '#e0f0ff', letterSpacing: '0.1em' }}>
            Memory Manager
          </h1>
        </div>
        <button
          onClick={() => { setEditingMemory(null); setShowModal(true) }}
          className="glow-btn-primary px-6 py-2.5 rounded-xl font-mono text-xs tracking-widest"
        >
          + NEW MEMORY
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {CATEGORIES.map(cat => {
          const count = memories.filter(m => m.category === cat.key).length
          return (
            <div key={cat.key} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: cat.color }}>{cat.icon}</span>
                <span className="font-mono text-[10px] tracking-widest" style={{ color: '#4a6080' }}>
                  {cat.label}
                </span>
              </div>
              <div className="font-display text-2xl font-bold" style={{ color: cat.color }}>
                {count}
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className="px-4 py-2 rounded-lg font-mono text-xs tracking-widest whitespace-nowrap transition-all"
          style={{
            background: activeCategory === 'all' ? 'rgba(0,212,255,0.1)' : 'transparent',
            border: `1px solid ${activeCategory === 'all' ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.1)'}`,
            color: activeCategory === 'all' ? '#00d4ff' : '#4a6080',
          }}
        >
          ALL ({memories.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = memories.filter(m => m.category === cat.key).length
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="px-4 py-2 rounded-lg font-mono text-xs tracking-widest whitespace-nowrap transition-all"
              style={{
                background: activeCategory === cat.key ? `${cat.color}15` : 'transparent',
                border: `1px solid ${activeCategory === cat.key ? cat.color + '50' : 'rgba(0,212,255,0.1)'}`,
                color: activeCategory === cat.key ? cat.color : '#4a6080',
              }}
            >
              {cat.icon} {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Memory grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 rounded-full ring-spin"
            style={{ border: '2px solid rgba(0,212,255,0.1)', borderTop: '2px solid #00d4ff' }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4">◉</div>
          <p className="font-display text-lg mb-2" style={{ color: '#4a6080' }}>No memories yet</p>
          <p className="font-mono text-sm mb-6" style={{ color: '#2a4060' }}>
            Chat with Jarvis to auto-build memory, or create one manually.
          </p>
          <button
            onClick={() => { setEditingMemory(null); setShowModal(true) }}
            className="glow-btn px-6 py-2.5 rounded-xl font-mono text-xs tracking-widest"
          >
            CREATE FIRST MEMORY
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(memory => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onEdit={m => { setEditingMemory(m); setShowModal(true) }}
              onDelete={handleDelete}
              onPin={handlePin}
            />
          ))}
        </div>
      )}
    </div>
  )
}
