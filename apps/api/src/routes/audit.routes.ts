import { Router } from 'express';
import { getAuditLogs, getAuditLogById } from '../controllers/audit.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { UserRole } from '@shasthi-guru/database';

const router = Router();

router.use(requireAuth);
// Restrict audit history to SUPER_ADMIN and ADMIN explicitly
router.use(requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN));

router.get('/', getAuditLogs);
router.get('/:id', getAuditLogById);

export default router;
