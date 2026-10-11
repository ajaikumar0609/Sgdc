import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@shasthi-guru/database';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');

    const where: any = { isPublished: true };
    if (category) {
      where.category = category;
    }

    const articles = await prisma.news.findMany({
      where,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: { name: true, role: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { articles },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
