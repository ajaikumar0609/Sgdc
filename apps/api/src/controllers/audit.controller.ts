import { Request, Response, NextFunction } from 'express';
import { prisma } from '@shasthi-guru/database';
import { z } from 'zod';
import { logAuditEvent } from '../services/audit.service';

const getAuditLogsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getAuditLogsSchema.parse(req.query);

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.action) {
      where.action = query.action;
    }

    if (query.entity) {
      where.entity = query.entity;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found.' });
    }

    // Log the read access to this sensitive record if the current user is not the one who performed the action.
    if (req.user && req.user.id !== log.userId) {
       await logAuditEvent({
          userId: req.user.id,
          action: 'VIEW',
          entity: 'AUDIT_LOG',
          entityId: log.id,
          details: { action: 'VIEW_AUDIT_LOG_DETAILS' },
          ipAddress: req.ip,
       });
    }

    return res.status(200).json({
      success: true,
      data: { log },
    });
  } catch (error) {
    next(error);
  }
}
