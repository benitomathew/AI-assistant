// lib/memory.ts
// Utilities for managing persistent memory and context injection

import { prisma } from './prisma'

export type MemoryCategory = 'preferences' | 'projects' | 'goals' | 'general'

export interface MemoryEntry {
  id: string
  category: MemoryCategory
  title: string
  content: string
  tags: string[]
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Retrieve all memories formatted as a context string for LLM injection
 */
export async function getMemoryContext(): Promise<string> {
  const memories = await prisma.memory.findMany({
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    take: 30, // Limit to keep context manageable
  })

  if (memories.length === 0) return ''

  const grouped = {
    preferences: memories.filter(m => m.category === 'preferences'),
    projects: memories.filter(m => m.category === 'projects'),
    goals: memories.filter(m => m.category === 'goals'),
    general: memories.filter(m => m.category === 'general'),
  }

  const sections: string[] = []

  if (grouped.preferences.length > 0) {
    sections.push(
      `USER PREFERENCES:\n${grouped.preferences.map(m => `- ${m.title}: ${m.content}`).join('\n')}`
    )
  }
  if (grouped.projects.length > 0) {
    sections.push(
      `USER PROJECTS:\n${grouped.projects.map(m => `- ${m.title}: ${m.content}`).join('\n')}`
    )
  }
  if (grouped.goals.length > 0) {
    sections.push(
      `USER GOALS:\n${grouped.goals.map(m => `- ${m.title}: ${m.content}`).join('\n')}`
    )
  }
  if (grouped.general.length > 0) {
    sections.push(
      `GENERAL NOTES:\n${grouped.general.map(m => `- ${m.title}: ${m.content}`).join('\n')}`
    )
  }

  return `\n\n[MEMORY CONTEXT - What you know about the user]\n${sections.join('\n\n')}\n[END MEMORY CONTEXT]\n`
}

/**
 * Extract and auto-save memories from an AI response
 * The AI is prompted to return memory JSON alongside its response
 */
export async function autoExtractMemories(
  userMessage: string,
  assistantResponse: string
): Promise<void> {
  // Simple heuristic extraction - in production you'd use a dedicated extraction call
  const patterns = [
    { regex: /my name is (\w+)/i, category: 'preferences' as const, title: 'Name' },
    { regex: /i (?:work|am working) on (.+?)(?:\.|$)/i, category: 'projects' as const, title: 'Current Project' },
    { regex: /my goal is (.+?)(?:\.|$)/i, category: 'goals' as const, title: 'Goal' },
    { regex: /i prefer (.+?)(?:\.|$)/i, category: 'preferences' as const, title: 'Preference' },
    { regex: /i (?:like|love|enjoy) (.+?)(?:\.|$)/i, category: 'preferences' as const, title: 'Interest' },
  ]

  for (const pattern of patterns) {
    const match = userMessage.match(pattern.regex)
    if (match) {
      const content = match[1].trim()
      if (content.length > 2 && content.length < 500) {
        // Upsert to avoid duplicates
        await prisma.memory.upsert({
          where: { id: `auto-${pattern.title.toLowerCase().replace(/\s+/g, '-')}` },
          update: { content, updatedAt: new Date() },
          create: {
            id: `auto-${pattern.title.toLowerCase().replace(/\s+/g, '-')}`,
            category: pattern.category,
            title: pattern.title,
            content,
            tags: 'auto-extracted',
          },
        })
      }
    }
  }
}

/**
 * Initialize default settings if none exist
 */
export async function ensureSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: 'default' } })
  if (!existing) {
    await prisma.settings.create({
      data: { id: 'default' },
    })
  }
}
