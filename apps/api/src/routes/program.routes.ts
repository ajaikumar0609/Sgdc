import { Router } from 'express';
import {
  getPublicPrograms,
  getPublicProgramBySlug,
  getPublicCategories,
  getAdminPrograms,
  getAdminProgramById,
  createAdminProgram,
  updateAdminProgram,
  deleteAdminProgram,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
} from '../controllers/program.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { UserRole } from '@shasthi-guru/database';

export const publicProgramRouter = Router();
publicProgramRouter.get('/', getPublicPrograms);
publicProgramRouter.get('/:slug', getPublicProgramBySlug);

export const publicCategoryRouter = Router();
publicCategoryRouter.get('/', getPublicCategories);

export const adminProgramRouter = Router();
adminProgramRouter.use(requireAuth);
adminProgramRouter.use(
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CONTENT_MANAGER)
);

// Categories
adminProgramRouter.get('/categories', getAdminCategories);
adminProgramRouter.post('/categories', createAdminCategory);
adminProgramRouter.patch('/categories/:id', updateAdminCategory);

// Programs
adminProgramRouter.get('/', getAdminPrograms);
adminProgramRouter.get('/:id', getAdminProgramById);
adminProgramRouter.post('/', createAdminProgram);
adminProgramRouter.patch('/:id', updateAdminProgram);
adminProgramRouter.delete('/:id', deleteAdminProgram);
