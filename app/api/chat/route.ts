import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMemoryContext, autoExtractMemories, ensureSettings } from '@/lib/memory'

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Ensure settings exist
    await ensureSettings()

    // Get or create conversation
    let convId = conversationId
    if (!convId) {
      const conv = await prisma.conversation.create({
        data: {
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        },
      })
      convId = conv.id
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: convId,
        role: 'user',
        content: message,
      },
    })

    // Get settings and memory context
    const [settings, memoryContext] = await Promise.all([
      prisma.settings.findUnique({ where: { id: 'default' } }),
      getMemoryContext(),
    ])

    // Get recent conversation history (last 10 messages)
    const history = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: 'desc' },
      take: 11, // +1 to exclude the just-saved user message
    })
    const recentHistory = history
      .slice(1) // skip the message we just saved
      .reverse()
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    // Build system prompt
    const assistantName = settings?.assistantName ?? 'Jarvis'
    const userName = settings?.userName ?? 'User'
    const basePrompt =
      settings?.systemPrompt ??
      `You are ${assistantName}, an advanced AI personal assistant. Be concise, intelligent, and helpful.`

    const systemPrompt = `${basePrompt}

The user's name is ${userName}. Address them by name occasionally.
${memoryContext}

Guidelines:
- Be conversational but precise
- Remember context from this conversation
- If you learn something important about the user, acknowledge it naturally
- Keep responses concise unless detail is requested`

    // Call Anthropic API
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured. Add it to your .env file.' },
        { status: 500 }
      )
    }

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...recentHistory,
          { role: 'user', content: message },
        ],
      }),
    })

    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.json().catch(() => ({}))
      console.error('Anthropic API error:', errorData)
      return NextResponse.json(
        { error: `API error: ${anthropicResponse.status}` },
        { status: 500 }
      )
    }

    const data = await anthropicResponse.json()
    const assistantMessage = data.content?.[0]?.text ?? 'I encountered an error processing your request.'

    // Save assistant response
    const savedMessage = await prisma.message.create({
      data: {
        conversationId: convId,
        role: 'assistant',
        content: assistantMessage,
      },
    })

    // Auto-extract memories if enabled
    if (settings?.autoSaveMemory) {
      await autoExtractMemories(message, assistantMessage).catch(console.error)
    }

    return NextResponse.json({
      message: assistantMessage,
      messageId: savedMessage.id,
      conversationId: convId,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET conversation history
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get('conversationId')

  if (!conversationId) {
    // Return list of conversations
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    return NextResponse.json(conversations)
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages)
}
