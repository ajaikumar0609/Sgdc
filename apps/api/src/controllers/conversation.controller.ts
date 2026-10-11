import { Request, Response, NextFunction } from 'express';
import { prisma, InteractionChannel } from '@shasthi-guru/database';
import { logAuditEvent } from '../services/audit.service';

export async function getStudentConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.params.id;

    // COUNSELOR ISOLATION
    if (req.user!.role === 'COUNSELOR') {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          enquiries: { select: { assignedCounselorId: true } },
          followUps: { select: { counselorId: true } },
        },
      });

      if (!student) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found.' } });
      }

      const hasAssignedEnquiry = student.enquiries.some((e) => e.assignedCounselorId === req.user!.id);
      const hasAssignedFollowUp = student.followUps.some((f) => f.counselorId === req.user!.id);

      if (!hasAssignedEnquiry && !hasAssignedFollowUp) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to view conversations for this student.' },
        });
      }
    }

    const conversations = await prisma.conversation.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        enquiry: {
          select: { id: true, enquiryCode: true, status: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
}

export async function addConversationEntry(req: Request, res: Response, next: NextFunction) {
  try {
    const studentId = req.params.id;
    const user = req.user!;
    const { message, channel = InteractionChannel.PHONE, enquiryId, title } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Message content is required.' },
      });
    }

    // COUNSELOR ISOLATION
    if (user.role === 'COUNSELOR') {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          enquiries: { select: { assignedCounselorId: true } },
          followUps: { select: { counselorId: true } },
        },
      });

      if (!student) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found.' } });
      }

      const hasAssignedEnquiry = student.enquiries.some((e) => e.assignedCounselorId === user.id);
      const hasAssignedFollowUp = student.followUps.some((f) => f.counselorId === user.id);

      if (!hasAssignedEnquiry && !hasAssignedFollowUp) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to add conversations for this student.' },
        });
      }
    }

    // Find latest enquiry for this student if not provided
    let activeEnquiryId = enquiryId;
    if (!activeEnquiryId) {
      const latestEnquiry = await prisma.admissionEnquiry.findFirst({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      if (!latestEnquiry) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'No active enquiry found for this student.' },
        });
      }
      activeEnquiryId = latestEnquiry.id;
    }

    // Find or create conversation container
    let conversation = await prisma.conversation.findFirst({
      where: {
        studentId,
        enquiryId: activeEnquiryId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          studentId,
          enquiryId: activeEnquiryId,
          title: title || 'Counselling Interaction Timeline',
        },
      });
    }

    // Create the message entry
    const entry = await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        channel: Object.values(InteractionChannel).includes(channel)
          ? channel
          : InteractionChannel.PHONE,
        message: message.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: 'CONVERSATION_NOTE_ADDED',
      entity: 'ConversationMessage',
      entityId: entry.id,
      details: { studentId, enquiryId: activeEnquiryId, channel },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Timeline interaction recorded successfully.',
      data: { entry },
    });
  } catch (error) {
    next(error);
  }
}

export async function listAdminConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const where: any = {};

    // Counselors only see conversations related to their assigned enquiries
    if (user.role === 'COUNSELOR') {
      where.enquiry = {
        assignedCounselorId: user.id,
      };
    }

    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            phone: true,
            district: true,
            areaOfInterest: true,
          },
        },
        enquiry: {
          select: {
            id: true,
            enquiryCode: true,
            status: true,
            assignedCounselorId: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            sender: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
}

