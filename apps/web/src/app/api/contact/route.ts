import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@shasthi-guru/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Name, email, and message are required.' },
        },
        { status: 400 }
      );
    }

    const contact = await prisma.contactEnquiry.create({
      data: {
        name,
        email,
        phone: phone || '',
        subject: subject || 'General Website Enquiry',
        message,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. Our counsellors will get back to you shortly.',
      data: { contactId: contact.id },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
