import { Router } from 'express';
import { processDonation, paymentWebhook, getAdminDonations, getAdminDonationById } from '../controllers/donation.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { publicFormLimiter } from '../middlewares/rateLimiter.middleware';
import { UserRole } from '@shasthi-guru/database';

const router = Router();

// Public routes
router.post('/donations', publicFormLimiter, processDonation);
router.post('/payments/webhook', paymentWebhook);

// Admin routes (Protected)
const adminRouter = Router();
adminRouter.use(requireAuth);
adminRouter.use(requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN));

adminRouter.get('/', getAdminDonations);
adminRouter.get('/:id', getAdminDonationById);

export { router as publicDonationRouter, adminRouter as adminDonationRouter };
