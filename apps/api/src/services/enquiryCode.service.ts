import { prisma } from '@shasthi-guru/database';

export async function generateEnquiryCode(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `SG-${currentYear}-`;

  // Find latest enquiry code for this year
  const latestEnquiry = await prisma.admissionEnquiry.findFirst({
    where: {
      enquiryCode: {
        startsWith: prefix,
      },
    },
    orderBy: {
      enquiryCode: 'desc',
    },
    select: {
      enquiryCode: true,
    },
  });

  let nextSequence = 101; // Start at 00101
  if (latestEnquiry) {
    const parts = latestEnquiry.enquiryCode.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) {
        nextSequence = parsed + 1;
      }
    }
  }

  const padded = String(nextSequence).padStart(5, '0');
  return `${prefix}${padded}`;
}
