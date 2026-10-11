import { Router } from 'express';
import { submitContactMessage, listAdminContactMessages } from '../controllers/contact.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { publicFormLimiter } from '../middlewares/rateLimiter.middleware';
import { UserRole } from '@shasthi-guru/database';

export const publicContactRouter = Router();
publicContactRouter.post('/', publicFormLimiter, submitContactMessage);

export const adminContactRouter = Router();
adminContactRouter.use(requireAuth);
adminContactRouter.use(requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN));
adminContactRouter.get('/', listAdminContactMessages);
