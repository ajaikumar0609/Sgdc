import { Request, Response, NextFunction } from 'express';
import { prisma, EnquiryStatus, EnquirySource, UserRole, FollowUpStatus } from '@shasthi-guru/database';
import { studentEnquirySchema } from '@shasthi-guru/shared';
import { generateEnquiryCode } from '../services/enquiryCode.service';
import { processAadhaarNumber } from '../services/aadhaar.service';
import { logAuditEvent } from '../services/audit.service';

export async function createPublicEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = studentEnquirySchema.parse(req.body);

    // Process Aadhaar securely behind feature flag
    const { encrypted: aadhaarEncrypted, masked: aadhaarMasked } = processAadhaarNumber(
      validatedData.aadhaarNumber
    );

    // Try finding matching program by name or slug if possible
    const matchedProgram = await prisma.program.findFirst({
      where: {
        OR: [
          { name: { contains: validatedData.courseProgram, mode: 'insensitive' } },
          { slug: { contains: validatedData.courseProgram.toLowerCase().replace(/\s+/g, '-') } },
        ],
      },
      select: { id: true },
    });

    // Find or create Student
    let student = await prisma.student.findFirst({
      where: {
        OR: [{ phone: validatedData.phone }, { email: validatedData.email }],
      },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          firstName: validatedData.firstName,
          phone: validatedData.phone,
          email: validatedData.email,
          address: validatedData.address,
          district: validatedData.district,
          areaOfInterest: validatedData.areaOfInterest,
          programId: matchedProgram?.id || null,
          mark12th: validatedData.mark12th,
          consentGiven: true,
          consentGivenAt: new Date(),
          aadhaarEncrypted,
          aadhaarMasked,
        },
      });
    } else {
      // Update student details with latest verified submission
      student = await prisma.student.update({
        where: { id: student.id },
        data: {
          firstName: validatedData.firstName,
          address: validatedData.address,
          district: validatedData.district,
          areaOfInterest: validatedData.areaOfInterest,
          mark12th: validatedData.mark12th,
          ...(matchedProgram && { programId: matchedProgram.id }),
          ...(aadhaarEncrypted && { aadhaarEncrypted, aadhaarMasked }),
        },
      });
    }

    // Generate Unique SG-YYYY-XXXXX Enquiry Reference
    const enquiryCode = await generateEnquiryCode();

    // Map source
    const validSources = Object.values(EnquirySource);
    const sourceKey = validSources.includes(validatedData.source as EnquirySource)
      ? (validatedData.source as EnquirySource)
      : EnquirySource.ENQUIRY;

    // Create Admission Enquiry
    const enquiry = await prisma.admissionEnquiry.create({
      data: {
        enquiryCode,
        studentId: student.id,
        programId: matchedProgram?.id || null,
        source: sourceKey,
        status: EnquiryStatus.NEW,
        internalNotes: `Submitted online enquiry for '${validatedData.courseProgram}' (${validatedData.areaOfInterest}).`,
      },
      include: {
        student: true,
        program: true,
      },
    });

    // Notify Admins
    const admins = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((adm) => ({
          recipientId: adm.id,
          type: 'ENQUIRY_NEW',
          title: `New Enquiry ${enquiryCode}`,
          message: `${student.firstName} from ${student.district} submitted an admission enquiry for ${validatedData.courseProgram}.`,
          linkUrl: `/admin/enquiries/${enquiry.id}`,
        })),
      });
    }

    // Audit Log
    await logAuditEvent({
      userId: null,
      action: 'ENQUIRY_SUBMITTED',
      entity: 'AdmissionEnquiry',
      entityId: enquiry.id,
      details: { enquiryCode, source: sourceKey, district: student.district },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Your admission enquiry has been submitted successfully. A counselor will contact you shortly.',
      data: {
        enquiryId: enquiry.id,
        enquiryCode: enquiry.enquiryCode,
        student: {
          firstName: student.firstName,
          email: student.email,
          phone: student.phone,
          district: student.district,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listAdminEnquiries(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { status, source, district, counselorId, search, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // COUNSELOR DATA ISOLATION: Counselors can only list enquiries assigned to themselves
    if (user.role === UserRole.COUNSELOR) {
      where.assignedCounselorId = user.id;
    } else if (counselorId) {
      where.assignedCounselorId = counselorId as string;
    }

    if (status) {
      where.status = status as EnquiryStatus;
    }

    if (source) {
      where.source = source as EnquirySource;
    }

    if (district) {
      where.student = { ...where.student, district: district as string };
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { enquiryCode: { contains: q, mode: 'insensitive' } },
        { student: { firstName: { contains: q, mode: 'insensitive' } } },
        { student: { phone: { contains: q } } },
        { student: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [total, enquiries] = await Promise.all([
      prisma.admissionEnquiry.count({ where }),
      prisma.admissionEnquiry.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              phone: true,
              email: true,
              district: true,
              areaOfInterest: true,
              mark12th: true,
              aadhaarMasked: true,
            },
          },
          program: {
            select: {
              id: true,
              name: true,
              slug: true,
              degreeLevel: true,
            },
          },
          assignedCounselor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          followUps: {
            where: { status: FollowUpStatus.SCHEDULED },
            orderBy: { scheduledAt: 'asc' },
            take: 1,
            select: { id: true, scheduledAt: true, status: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        enquiries,
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

export async function getAdminEnquiryById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const enquiry = await prisma.admissionEnquiry.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            phone: true,
            email: true,
            address: true,
            district: true,
            areaOfInterest: true,
            mark12th: true,
            consentGivenAt: true,
            aadhaarMasked: true, // Only masked Aadhaar
          },
        },
        program: true,
        assignedCounselor: {
          select: { id: true, name: true, email: true, phone: true },
        },
        followUps: {
          orderBy: { scheduledAt: 'desc' },
          include: { counselor: { select: { id: true, name: true } } },
        },
        conversations: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              include: { sender: { select: { id: true, name: true, role: true } } },
            },
          },
        },
      },
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Enquiry not found.' },
      });
    }

    if (req.user!.role === 'COUNSELOR' && enquiry.assignedCounselorId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to view this enquiry.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: { enquiry },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { status, assignedCounselorId, internalNotes } = req.body;

    const existing = await prisma.admissionEnquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Enquiry not found.' },
      });
    }

    if (user.role === 'COUNSELOR' && existing.assignedCounselorId !== user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to update this enquiry.' },
      });
    }

    const updates: any = {};

    // Status transition validation
    if (status) {
      const validStatuses = Object.values(EnquiryStatus);
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_STATUS', message: `Invalid status: '${status}'.` },
        });
      }
      updates.status = status;
    }

    // Counselor assignment (Super Admin & Admin only)
    if (assignedCounselorId !== undefined) {
      if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only Administrators can assign or reassign counselors.',
          },
        });
      }

      if (assignedCounselorId) {
        const counselor = await prisma.user.findUnique({
          where: { id: assignedCounselorId },
        });

        if (!counselor || counselor.role !== UserRole.COUNSELOR) {
          return res.status(400).json({
            success: false,
            error: { code: 'INVALID_COUNSELOR', message: 'Selected user is not a valid counselor.' },
          });
        }

        updates.assignedCounselorId = assignedCounselorId;
        if (existing.status === EnquiryStatus.NEW) {
          updates.status = EnquiryStatus.ASSIGNED;
        }

        // Notify Counselor
        await prisma.notification.create({
          data: {
            recipientId: assignedCounselorId,
            type: 'ENQUIRY_ASSIGNED',
            title: `Assigned Enquiry ${existing.enquiryCode}`,
            message: `You have been assigned enquiry ${existing.enquiryCode} for consultation.`,
            linkUrl: `/admin/enquiries/${id}`,
          },
        });
      } else {
        updates.assignedCounselorId = null;
      }
    }

    if (internalNotes !== undefined) {
      updates.internalNotes = internalNotes;
    }

    const updated = await prisma.admissionEnquiry.update({
      where: { id },
      data: updates,
      include: {
        student: true,
        assignedCounselor: { select: { id: true, name: true, email: true } },
      },
    });

    // Audit Log
    await logAuditEvent({
      userId: user.id,
      action: 'ENQUIRY_UPDATED',
      entity: 'AdmissionEnquiry',
      entityId: id,
      details: updates,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully.',
      data: { enquiry: updated },
    });
  } catch (error) {
    next(error);
  }
}
