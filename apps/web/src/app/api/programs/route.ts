import { NextResponse } from 'next/server';
import { prisma } from '@shasthi-guru/database';

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { programs },
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
