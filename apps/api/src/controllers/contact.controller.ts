import { Request, Response, NextFunction } from 'express';
import { prisma } from '@shasthi-guru/database';
import { z } from 'zod';
import { logAuditEvent } from '../services/audit.service';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Valid email address is required').trim().toLowerCase(),
  phone: z.string().min(10, 'Valid phone number is required').max(15).trim(),
  subject: z.string().min(2, 'Subject is required').max(150).trim(),
  message: z.string().min(5, 'Message must be at least 5 characters').max(2000).trim(),
});

export async function submitContactMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = contactSchema.parse(req.body);

    const contact = await prisma.contactEnquiry.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        subject: validated.subject,
        message: validated.message,
      },
    });

    await logAuditEvent({
      userId: null,
      action: 'CONTACT_ENQUIRY_RECEIVED',
      entity: 'ContactEnquiry',
      entityId: contact.id,
      details: { email: validated.email, subject: validated.subject },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Your message has been received. Our guidance team will get back to you shortly.',
      data: { contactId: contact.id },
    });
  } catch (error) {
    next(error);
  }
}

export async function listAdminContactMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status as string;
    }

    const [total, messages] = await Promise.all([
      prisma.contactEnquiry.count({ where }),
      prisma.contactEnquiry.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        messages,
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
