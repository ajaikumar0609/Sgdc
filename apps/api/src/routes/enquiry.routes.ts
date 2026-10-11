import { Router } from 'express';
import {
  createPublicEnquiry,
  listAdminEnquiries,
  getAdminEnquiryById,
  updateAdminEnquiry,
} from '../controllers/enquiry.controller';
import { createEnquiryFollowUp } from '../controllers/followUp.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  requireRole,
  checkCounselorEnquiryAccess,
} from '../middlewares/rbac.middleware';
import { publicFormLimiter } from '../middlewares/rateLimiter.middleware';
import { UserRole } from '@shasthi-guru/database';

export const publicEnquiryRouter = Router();
publicEnquiryRouter.post('/', publicFormLimiter, createPublicEnquiry);

export const adminEnquiryRouter = Router();
adminEnquiryRouter.use(requireAuth);
adminEnquiryRouter.use(
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COUNSELOR)
);

adminEnquiryRouter.get('/', listAdminEnquiries);
adminEnquiryRouter.get('/:id', checkCounselorEnquiryAccess, getAdminEnquiryById);
adminEnquiryRouter.patch('/:id', checkCounselorEnquiryAccess, updateAdminEnquiry);
adminEnquiryRouter.post('/:id/followups', checkCounselorEnquiryAccess, createEnquiryFollowUp);
