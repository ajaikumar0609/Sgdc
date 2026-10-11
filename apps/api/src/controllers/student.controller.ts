import { Request, Response, NextFunction } from 'express';
import { prisma, UserRole } from '@shasthi-guru/database';

export async function listAdminStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { district, areaOfInterest, search, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // COUNSELOR ISOLATION: A counselor only sees students assigned to them
    if (user.role === UserRole.COUNSELOR) {
      where.enquiries = {
        some: {
          assignedCounselorId: user.id,
        },
      };
    }

    if (district) {
      where.district = district as string;
    }

    if (areaOfInterest) {
      where.areaOfInterest = areaOfInterest as string;
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          phone: true,
          email: true,
          address: true,
          district: true,
          areaOfInterest: true,
          mark12th: true,
          aadhaarMasked: true, // Strictly masked
          createdAt: true,
          program: {
            select: { id: true, name: true, degreeLevel: true },
          },
          _count: {
            select: { enquiries: true, followUps: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        students,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminStudentById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        phone: true,
        email: true,
        address: true,
        district: true,
        areaOfInterest: true,
        mark12th: true,
        consentGiven: true,
        consentGivenAt: true,
        aadhaarMasked: true, // Plaintext or encrypted Aadhaar is NEVER sent to client
        createdAt: true,
        updatedAt: true,
        program: true,
        enquiries: {
          include: {
            assignedCounselor: { select: { id: true, name: true, email: true } },
          },
        },
        followUps: {
          orderBy: { scheduledAt: 'desc' },
          include: { counselor: { select: { id: true, name: true } } },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student not found.' },
      });
    }

    // COUNSELOR ISOLATION
    if (req.user!.role === 'COUNSELOR') {
      const hasAssignedEnquiry = student.enquiries.some((e) => e.assignedCounselorId === req.user!.id);
      const hasAssignedFollowUp = student.followUps.some((f) => f.counselorId === req.user!.id);

      if (!hasAssignedEnquiry && !hasAssignedFollowUp) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to view this student.' },
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: { student },
    });
  } catch (error) {
    next(error);
  }
}
