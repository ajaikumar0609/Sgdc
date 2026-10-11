import { Request, Response, NextFunction } from 'express';
import { prisma, DonationStatus, PaymentStatus } from '@shasthi-guru/database';
import { env } from '../config/env';
import { logAuditEvent } from '../services/audit.service';
import crypto from 'crypto';

export async function processDonation(req: Request, res: Response, next: NextFunction) {
  try {
    if (!env.ENABLE_DONATION_MODULE) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'DONATION_MODULE_DISABLED',
          message:
            'The donation module is currently disabled pending organizational compliance and gateway confirmation.',
        },
      });
    }

    const { donorName, donorEmail, donorPhone, amount, supportCategory, isAnonymous } = req.body;

    if (!donorName || !donorEmail || !amount || !supportCategory) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields.',
        },
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid donation amount.',
        },
      });
    }

    // Create donation intent
    const donation = await prisma.donation.create({
      data: {
        donorName,
        donorEmail,
        donorPhone,
        amount: numericAmount,
        supportCategory,
        isAnonymous: isAnonymous ?? false,
        status: DonationStatus.INITIATED,
      },
    });

    // Create a pending transaction
    const transaction = await prisma.donationTransaction.create({
      data: {
        donationId: donation.id,
        amount: numericAmount,
        gatewayName: env.ENABLE_PAYMENT_GATEWAY ? 'SANDBOX_GATEWAY' : 'MOCK_GATEWAY',
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    // If real payments were enabled, we'd initialize the payment provider session here.
    const checkoutUrl = env.ENABLE_PAYMENT_GATEWAY
      ? `https://sandbox.paymentprovider.example.com/checkout/${transaction.id}`
      : null;

    return res.status(201).json({
      success: true,
      data: {
        donationId: donation.id,
        transactionId: transaction.id,
        checkoutUrl,
        message: 'Donation initiated securely.',
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function paymentWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    if (!env.ENABLE_PAYMENT_GATEWAY) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PAYMENT_GATEWAY_DISABLED',
          message: 'Payment gateway processing is currently inactive.',
        },
      });
    }

    // 1. Signature Verification
    const signature = req.headers['x-provider-signature'];
    if (!signature) {
      return res.status(401).json({ success: false, message: 'Missing signature.' });
    }
    
    const expectedSignature = crypto.createHmac('sha256', env.WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex');
    if (signature !== expectedSignature) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }
    
    // 2. Validate Payload
    const { transactionId, status, rawAmount, gatewayReference } = req.body;
    
    if (!transactionId || !status) {
      return res.status(400).json({ success: false, message: 'Malformed payload.' });
    }

    const transaction = await prisma.donationTransaction.findUnique({
      where: { id: transactionId },
      include: { donation: true },
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    // Idempotency check
    if (transaction.paymentStatus === PaymentStatus.COMPLETED || transaction.paymentStatus === PaymentStatus.FAILED) {
      return res.status(200).json({ success: true, message: 'Webhook already processed.' });
    }

    // Amount validation (Security)
    if (rawAmount && parseFloat(rawAmount) !== parseFloat(transaction.amount.toString())) {
      // Amount mismatch attack detected
      await prisma.donationTransaction.update({
        where: { id: transaction.id },
        data: { paymentStatus: PaymentStatus.FAILED, rawResponse: JSON.stringify(req.body) },
      });
      await prisma.donation.update({
        where: { id: transaction.donationId },
        data: { status: DonationStatus.FAILED },
      });
      return res.status(400).json({ success: false, message: 'Amount mismatch.' });
    }

    // State Transitions
    let newPaymentStatus: PaymentStatus = PaymentStatus.PENDING;
    let newDonationStatus: DonationStatus = DonationStatus.PENDING;
    let receiptNumber = null;

    if (status === 'SUCCESS') {
      newPaymentStatus = PaymentStatus.COMPLETED;
      newDonationStatus = DonationStatus.SUCCESSFUL;
      receiptNumber = `REC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    } else if (status === 'FAILED') {
      newPaymentStatus = PaymentStatus.FAILED;
      newDonationStatus = DonationStatus.FAILED;
    }

    await prisma.$transaction([
      prisma.donationTransaction.update({
        where: { id: transaction.id },
        data: {
          paymentStatus: newPaymentStatus,
          gatewayReference: gatewayReference || null,
          rawResponse: JSON.stringify(req.body),
        },
      }),
      prisma.donation.update({
        where: { id: transaction.donationId },
        data: {
          status: newDonationStatus,
          ...(receiptNumber && { receiptNumber }),
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

export async function getAdminDonations(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, search, page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    
    if (status && Object.values(DonationStatus).includes(status as DonationStatus)) {
      where.status = status as DonationStatus;
    }
    
    if (search) {
      where.OR = [
        { donorName: { contains: search as string, mode: 'insensitive' } },
        { donorEmail: { contains: search as string, mode: 'insensitive' } },
        { receiptNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.donation.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        donations,
        meta: { total, page: parseInt(page as string), limit: take },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminDonationById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Donation record not found.' },
      });
    }

    if (req.user) {
      await logAuditEvent({
        userId: req.user.id,
        action: 'VIEW', // Using string literal as action is String in schema
        entity: 'DONATION',
        entityId: donation.id,
        details: { action: 'VIEW_DONATION_DETAILS' },
        ipAddress: req.ip,
      });
    }

    return res.status(200).json({
      success: true,
      data: { donation },
    });
  } catch (error) {
    next(error);
  }
}
