import { Router } from 'express';
import { getUserNotifications, markNotificationAsRead, markNotificationAsUnread } from '../controllers/notification.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/', getUserNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.patch('/:id/unread', markNotificationAsUnread);

export default router;
