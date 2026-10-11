import { Router } from 'express';
import { listCounselors } from '../controllers/counselor.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { UserRole } from '@shasthi-guru/database';

const router = Router();

router.use(requireAuth);
router.use(requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN));
router.get('/', listCounselors);

export default router;
