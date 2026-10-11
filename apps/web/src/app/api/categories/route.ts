import { NextResponse } from 'next/server';
import { prisma } from '@shasthi-guru/database';

export async function GET() {
  try {
    const categories = await prisma.programCategory.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: { categories },
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
