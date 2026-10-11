import { Request, Response, NextFunction } from 'express';
import { prisma, FollowUpStatus, UserRole } from '@shasthi-guru/database';
import { logAuditEvent } from '../services/audit.service';

export async function createEnquiryFollowUp(req: Request, res: Response, next: NextFunction) {
  try {
    const enquiryId = req.params.id;
    const user = req.user!;
    const { scheduledAt, feedbackNote, nextActionDate, status = FollowUpStatus.SCHEDULED } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'scheduledAt timestamp is required.' },
      });
    }

    const enquiry = await prisma.admissionEnquiry.findUnique({
      where: { id: enquiryId },
      select: { id: true, studentId: true, assignedCounselorId: true, status: true },
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Enquiry not found.' },
      });
    }

    if (user.role === 'COUNSELOR' && enquiry.assignedCounselorId !== user.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to add a follow-up to this enquiry.' },
      });
    }

    const followUp = await prisma.followUp.create({
      data: {
        enquiryId: enquiry.id,
        studentId: enquiry.studentId,
        counselorId: user.id, // Current staff logging follow-up
        scheduledAt: new Date(scheduledAt),
        status,
        feedbackNote,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
      },
      include: {
        counselor: { select: { id: true, name: true, email: true } },
      },
    });

    // Optionally transition enquiry status to FOLLOW_UP if currently NEW, ASSIGNED, or CONTACTED
    if (
      status === FollowUpStatus.SCHEDULED &&
      ['NEW', 'ASSIGNED', 'CONTACTED'].includes(enquiry.status)
    ) {
      await prisma.admissionEnquiry.update({
        where: { id: enquiryId },
        data: { status: 'FOLLOW_UP' },
      });
    }

    await logAuditEvent({
      userId: user.id,
      action: 'FOLLOW_UP_CREATED',
      entity: 'FollowUp',
      entityId: followUp.id,
      details: { enquiryId, scheduledAt, status },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Follow-up created successfully.',
      data: { followUp },
    });
  } catch (error) {
    next(error);
  }
}

export async function listAdminFollowUps(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const { status, date } = req.query;

    const where: any = {};
    if (user.role === 'COUNSELOR') {
      where.counselorId = user.id;
    }

    if (status) {
      where.status = status as FollowUpStatus;
    }

    const followUps = await prisma.followUp.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        enquiry: {
          select: { id: true, enquiryCode: true, status: true },
        },
        student: {
          select: { id: true, firstName: true, phone: true, district: true },
        },
        counselor: {
          select: { id: true, name: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { followUps },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateFollowUp(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { status, feedbackNote, nextActionDate } = req.body;

    const followUp = await prisma.followUp.findUnique({
      where: { id },
      include: { enquiry: true },
    });

    if (!followUp) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Follow-up not found.' },
      });
    }

    if (
      user.role === UserRole.COUNSELOR &&
      followUp.counselorId !== user.id &&
      followUp.enquiry?.assignedCounselorId !== user.id
    ) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied to this follow-up record.' },
      });
    }

    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(status === FollowUpStatus.COMPLETED ? { completedAt: new Date() } : {}),
        ...(status === FollowUpStatus.SCHEDULED ? { completedAt: null } : {}),
        ...(feedbackNote !== undefined ? { feedbackNote } : {}),
        ...(nextActionDate !== undefined ? { nextActionDate: nextActionDate ? new Date(nextActionDate) : null } : {}),
      },
      include: {
        counselor: { select: { id: true, name: true } },
        enquiry: { select: { id: true, enquiryCode: true, status: true } },
        student: { select: { id: true, firstName: true, phone: true } },
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'FOLLOW_UP_UPDATED',
      entity: 'FollowUp',
      entityId: id,
      details: { status, feedbackNote },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Follow-up updated successfully.',
      data: { followUp: updated },
    });
  } catch (error) {
    next(error);
  }
}
