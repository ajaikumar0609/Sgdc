import { Router } from 'express';
import { getDashboardReports } from '../controllers/report.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { UserRole } from '@shasthi-guru/database';

const router = Router();

router.use(requireAuth);
router.use(
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COUNSELOR)
);
router.get('/dashboard', getDashboardReports);

export default router;
