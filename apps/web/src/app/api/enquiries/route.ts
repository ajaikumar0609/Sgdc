import { NextRequest, NextResponse } from 'next/server';
import { prisma, EnquiryStatus, EnquirySource } from '@shasthi-guru/database';
import { studentEnquirySchema } from '@shasthi-guru/shared';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = studentEnquirySchema.parse(body);

    // Try finding matching program by name or slug
    const matchedProgram = await prisma.program.findFirst({
      where: {
        OR: [
          { name: { contains: validatedData.courseProgram, mode: 'insensitive' } },
          { slug: { contains: validatedData.courseProgram.toLowerCase().replace(/\s+/g, '-') } },
        ],
      },
      select: { id: true },
    });

    // Find or create Student
    let student = await prisma.student.findFirst({
      where: {
        OR: [{ phone: validatedData.phone }, { email: validatedData.email }],
      },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          firstName: validatedData.firstName,
          phone: validatedData.phone,
          email: validatedData.email,
          address: validatedData.address,
          district: validatedData.district,
          areaOfInterest: validatedData.areaOfInterest,
          programId: matchedProgram?.id || null,
          mark12th: validatedData.mark12th,
          consentGiven: true,
          consentGivenAt: new Date(),
        },
      });
    }

    // Generate enquiry code
    const year = new Date().getFullYear();
    const count = await prisma.admissionEnquiry.count();
    const enquiryCode = `SG-${year}-${String(count + 1).padStart(5, '0')}`;

    const enquiry = await prisma.admissionEnquiry.create({
      data: {
        enquiryCode,
        studentId: student.id,
        programId: matchedProgram?.id || null,
        source: EnquirySource.ENQUIRY,
        status: EnquiryStatus.NEW,
        internalNotes: `Web enquiry submitted for course: ${validatedData.courseProgram}`,
      },
      include: {
        student: true,
        program: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admission enquiry submitted successfully.',
      data: {
        enquiryCode: enquiry.enquiryCode,
        enquiryId: enquiry.id,
      },
    });
  } catch (error: any) {
    console.error('Enquiry error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'ENQUIRY_ERROR', message: error.message || 'Failed to submit enquiry.' },
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const enquiries = await prisma.admissionEnquiry.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        student: true,
        program: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { enquiries },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
