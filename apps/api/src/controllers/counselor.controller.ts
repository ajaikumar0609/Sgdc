import { Request, Response, NextFunction } from 'express';
import { prisma, UserRole, UserStatus } from '@shasthi-guru/database';

export async function listCounselors(req: Request, res: Response, next: NextFunction) {
  try {
    const counselors = await prisma.user.findMany({
      where: {
        role: UserRole.COUNSELOR,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        _count: {
          select: {
            assignedEnquiries: {
              where: {
                status: {
                  notIn: ['CONVERTED', 'CLOSED'],
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: {
        counselors: counselors.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          activeCaseload: c._count.assignedEnquiries,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}
