import { Router } from 'express';
import authRoutes from './auth.routes';
import { publicEnquiryRouter, adminEnquiryRouter } from './enquiry.routes';
import {
  publicProgramRouter,
  publicCategoryRouter,
  adminProgramRouter,
} from './program.routes';
import { publicNewsRouter, adminNewsRouter } from './news.routes';
import { publicContactRouter, adminContactRouter } from './contact.routes';
import { publicDonationRouter, adminDonationRouter } from './donation.routes';
import studentRoutes from './student.routes';
import counselorRoutes from './counselor.routes';
import followUpRoutes from './followUp.routes';
import conversationRoutes from './conversation.routes';
import reportRoutes from './report.routes';
import notificationRoutes from './notification.routes';
import { publicWelfareRouter, adminWelfareRouter } from './welfare.routes';
import auditRoutes from './audit.routes';

import { prisma, ContentStatus } from '@shasthi-guru/database';



const rootRouter = Router();

// -------------------------------------------------------------
// PUBLIC REST ENDPOINTS
// -------------------------------------------------------------
rootRouter.use('/auth', authRoutes);
rootRouter.use('/enquiries', publicEnquiryRouter);
rootRouter.use('/programs', publicProgramRouter);
rootRouter.use('/categories', publicCategoryRouter);
rootRouter.use('/news', publicNewsRouter);
rootRouter.use('/contact', publicContactRouter);
rootRouter.use('/welfare', publicWelfareRouter);
rootRouter.use('/', publicDonationRouter); // /donations and /payments/webhook

// -------------------------------------------------------------
// PROTECTED /admin REST ENDPOINTS
// -------------------------------------------------------------
rootRouter.use('/admin/enquiries', adminEnquiryRouter);
rootRouter.use('/admin/students', studentRoutes);
rootRouter.use('/admin/counselors', counselorRoutes);
rootRouter.use('/admin/follow-ups', followUpRoutes);
rootRouter.use('/admin/conversations', conversationRoutes);
rootRouter.use('/admin/programs', adminProgramRouter);
rootRouter.use('/admin/news', adminNewsRouter);
rootRouter.use('/admin/contact', adminContactRouter);
rootRouter.use('/admin/reports', reportRoutes);
rootRouter.use('/admin/notifications', notificationRoutes);
rootRouter.use('/admin/welfare', adminWelfareRouter);
rootRouter.use('/admin/donations', adminDonationRouter);
rootRouter.use('/admin/audit-logs', auditRoutes);

export default rootRouter;
