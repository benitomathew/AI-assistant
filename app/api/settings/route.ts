import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureSettings } from '@/lib/memory'

export async function GET() {
  await ensureSettings()
  const settings = await prisma.settings.findUnique({ where: { id: 'default' } })
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body // strip id if sent

  await ensureSettings()

  const settings = await prisma.settings.update({
    where: { id: 'default' },
    data,
  })

  return NextResponse.json(settings)
}
