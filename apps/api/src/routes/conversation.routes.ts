import { Router } from 'express';
import { listAdminConversations } from '../controllers/conversation.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { UserRole } from '@shasthi-guru/database';

const router = Router();

router.use(requireAuth);
router.use(
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COUNSELOR)
);
router.get('/', listAdminConversations);

export default router;
