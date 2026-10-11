import { Router } from 'express';
import { listAdminStudents, getAdminStudentById } from '../controllers/student.controller';
import { getStudentConversations, addConversationEntry } from '../controllers/conversation.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  requireRole,
  checkCounselorStudentAccess,
} from '../middlewares/rbac.middleware';
import { UserRole } from '@shasthi-guru/database';

const router = Router();

router.use(requireAuth);
router.use(
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COUNSELOR)
);

router.get('/', listAdminStudents);
router.get('/:id', checkCounselorStudentAccess, getAdminStudentById);
router.get('/:id/conversations', checkCounselorStudentAccess, getStudentConversations);
router.post('/:id/conversations', checkCounselorStudentAccess, addConversationEntry);

export default router;
