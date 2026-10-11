import { Router } from 'express';
import {
  getPublicImpactStats,
  getAdminImpactStats,
  updateImpactStat,
  getPublicStudentStories,
  getAdminStudentStories,
  createStudentStory,
  updateStudentStory,
  deleteStudentStory,
} from '../controllers/welfare.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { UserRole } from '@shasthi-guru/database';

export const publicWelfareRouter = Router();
export const adminWelfareRouter = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
publicWelfareRouter.get('/impact', getPublicImpactStats);
publicWelfareRouter.get('/stories', getPublicStudentStories);

// ==========================================
// ADMIN ROUTES (Protected)
// ==========================================
adminWelfareRouter.use(requireAuth);
adminWelfareRouter.use(
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CONTENT_MANAGER)
);

adminWelfareRouter.get('/impact', getAdminImpactStats);
adminWelfareRouter.put('/impact/:id', updateImpactStat);

adminWelfareRouter.get('/stories', getAdminStudentStories);
adminWelfareRouter.post('/stories', createStudentStory);
adminWelfareRouter.put('/stories/:id', updateStudentStory);
adminWelfareRouter.delete('/stories/:id', deleteStudentStory);
