import { Router } from 'express';
import {
  getPublicNews,
  getPublicNewsBySlug,
  getAdminNews,
  getAdminNewsById,
  createAdminNews,
  updateAdminNews,
  deleteAdminNews,
} from '../controllers/news.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { UserRole } from '@shasthi-guru/database';

export const publicNewsRouter = Router();
publicNewsRouter.get('/', getPublicNews);
publicNewsRouter.get('/:slug', getPublicNewsBySlug);

export const adminNewsRouter = Router();
adminNewsRouter.use(requireAuth);
adminNewsRouter.use(
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CONTENT_MANAGER)
);

adminNewsRouter.get('/', getAdminNews);
adminNewsRouter.get('/:id', getAdminNewsById);
adminNewsRouter.post('/', createAdminNews);
adminNewsRouter.patch('/:id', updateAdminNews);
adminNewsRouter.delete('/:id', deleteAdminNews);
