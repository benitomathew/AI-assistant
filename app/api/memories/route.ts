import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all memories
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const memories = await prisma.memory.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
  })

  return NextResponse.json(memories)
}

// POST create memory
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { category, title, content, tags, isPinned } = body

  if (!category || !title || !content) {
    return NextResponse.json({ error: 'category, title, and content are required' }, { status: 400 })
  }

  const memory = await prisma.memory.create({
    data: {
      category,
      title,
      content,
      tags: Array.isArray(tags) ? tags.join(',') : (tags ?? ''),
      isPinned: isPinned ?? false,
    },
  })

  return NextResponse.json(memory)
}

// PUT update memory
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  if (data.tags && Array.isArray(data.tags)) {
    data.tags = data.tags.join(',')
  }

  const memory = await prisma.memory.update({
    where: { id },
    data,
  })

  return NextResponse.json(memory)
}

// DELETE memory
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  await prisma.memory.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
