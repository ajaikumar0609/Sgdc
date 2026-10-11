import { NextResponse } from 'next/server';
import { prisma } from '@shasthi-guru/database';

export async function GET() {
  try {
    const stories = await prisma.studentStory.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: { stories },
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
