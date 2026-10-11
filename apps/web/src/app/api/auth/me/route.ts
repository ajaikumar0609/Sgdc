import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@shasthi-guru/database';

const JWT_SECRET = process.env.JWT_SECRET || 'shasthi_guru_dev_jwt_secret_change_in_production_2026';

export async function GET(req: NextRequest) {
  try {
    let token = req.cookies.get('shasthi_guru_auth')?.value;

    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'No authentication token found.' },
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Account is inactive or not found.' },
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Session expired or invalid token.' },
      },
      { status: 401 }
    );
  }
}
