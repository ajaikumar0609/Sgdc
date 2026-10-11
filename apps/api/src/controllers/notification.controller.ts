import { Request, Response, NextFunction } from 'express';
import { prisma } from '@shasthi-guru/database';
import { z } from 'zod';

const getNotificationsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isRead: z.enum(['true', 'false']).optional(),
  type: z.string().optional(),
  search: z.string().optional(),
});

export async function getUserNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const query = getNotificationsSchema.parse(req.query);

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {
      recipientId: user.id,
    };

    if (query.isRead !== undefined) {
      where.isRead = query.isRead === 'true';
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { message: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          recipientId: user.id,
          isRead: false,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user!;

    const notification = await prisma.notification.findFirst({
      where: { id, recipientId: user.id },
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsUnread(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user!;

    const notification = await prisma.notification.findFirst({
      where: { id, recipientId: user.id },
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    await prisma.notification.update({
      where: { id },
      data: {
        isRead: false,
        readAt: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as unread.',
    });
  } catch (error) {
    next(error);
  }
}
