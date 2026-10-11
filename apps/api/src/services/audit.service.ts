import { prisma } from '@shasthi-guru/database';

export interface AuditLogParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown> | string | null;
  ipAddress?: string | null;
}

export async function logAuditEvent({
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress,
}: AuditLogParams): Promise<void> {
  try {
    let serializedDetails: string | null = null;
    if (typeof details === 'object' && details !== null) {
      // Never store sensitive keys
      const sanitized = { ...details };
      delete (sanitized as Record<string, unknown>).password;
      delete (sanitized as Record<string, unknown>).passwordHash;
      delete (sanitized as Record<string, unknown>).token;
      delete (sanitized as Record<string, unknown>).rawAadhaar;
      serializedDetails = JSON.stringify(sanitized);
    } else if (typeof details === 'string') {
      serializedDetails = details;
    }

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId,
        details: serializedDetails,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    // Audit failures should not crash the primary operational transaction, but should log to server stderr
    console.error('AuditLog writing failed:', error);
  }
}
