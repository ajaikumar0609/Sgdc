import { Request, Response, NextFunction } from 'express';
import { prisma, UserRole } from '@shasthi-guru/database';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Forbidden: role '${req.user.role}' lacks permission for this operation.`,
        },
      });
    }

    next();
  };
}

/**
 * Ensures Counselors can ONLY access their own assigned enquiries.
 * Super Admins and Admins have global access.
 */
export async function checkCounselorEnquiryAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    // Admins and Super Admins bypass counselor isolation
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
      return next();
    }

    const enquiryId = req.params.id || req.params.enquiryId || req.body.enquiryId;
    if (!enquiryId) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Missing enquiry identifier.' },
      });
    }

    const enquiry = await prisma.admissionEnquiry.findUnique({
      where: { id: enquiryId },
      select: { id: true, assignedCounselorId: true },
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Admission enquiry not found.' },
      });
    }

    if (user.role === UserRole.COUNSELOR) {
      if (enquiry.assignedCounselorId !== user.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied: You are only permitted to view or manage enquiries assigned directly to you.',
          },
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Ensures Counselors can ONLY view students who have at least one enquiry assigned to them.
 */
export async function checkCounselorStudentAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
      return next();
    }

    const studentId = req.params.id || req.params.studentId || req.body.studentId;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Missing student identifier.' },
      });
    }

    if (user.role === UserRole.COUNSELOR) {
      const assignedEnquiry = await prisma.admissionEnquiry.findFirst({
        where: {
          studentId,
          assignedCounselorId: user.id,
        },
      });

      if (!assignedEnquiry) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied: This student is not assigned to your counselor caseload.',
          },
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
