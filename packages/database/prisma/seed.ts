import { PrismaClient, UserRole, UserStatus, EnquiryStatus, EnquirySource, FollowUpStatus, InteractionChannel, ContentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Shasthi Guru Dream Campus database seeding...');

  // Clean existing development data safely (children first)
  console.log('🧹 Cleaning existing test data...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.donationTransaction.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.contactEnquiry.deleteMany();
  await prisma.conversationMessage.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.admissionEnquiry.deleteMany();
  await prisma.student.deleteMany();
  await prisma.program.deleteMany();
  await prisma.programCategory.deleteMany();
  await prisma.news.deleteMany();
  await prisma.impactStatistic.deleteMany();
  await prisma.user.deleteMany();

  // 1. SEED USERS (RBAC Accounts)
  console.log('👤 Seeding RBAC staff accounts...');
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('ShasthiAdmin2026!', salt);

  const superAdmin = await prisma.user.create({
    data: {
      name: 'System Administrator (Demo)',
      email: 'superadmin@shasthiguru.com',
      passwordHash: await bcrypt.hash('ShasthiSuperAdmin2026!', salt),
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      phone: '+91 98400 00001',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Ananya Ramanathan (Admin)',
      email: 'admin@shasthiguru.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: '+91 98400 00002',
    },
  });

  const counselor1 = await prisma.user.create({
    data: {
      name: 'Karthik Subramanian (Lead Counselor)',
      email: 'karthik.counselor@shasthiguru.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.COUNSELOR,
      status: UserStatus.ACTIVE,
      phone: '+91 98400 00003',
    },
  });

  const counselor2 = await prisma.user.create({
    data: {
      name: 'Priya Sundaram (Education Counselor)',
      email: 'priya.counselor@shasthiguru.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.COUNSELOR,
      status: UserStatus.ACTIVE,
      phone: '+91 98400 00004',
    },
  });

  const contentManager = await prisma.user.create({
    data: {
      name: 'Vignesh Kumar (Content Lead)',
      email: 'content@shasthiguru.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.CONTENT_MANAGER,
      status: UserStatus.ACTIVE,
      phone: '+91 98400 00005',
    },
  });

  // 2. SEED PROGRAM CATEGORIES
  console.log('📚 Seeding program categories...');
  const catEngineering = await prisma.programCategory.create({
    data: {
      name: 'Engineering & Technology',
      slug: 'engineering',
      description: 'Undergraduate and postgraduate technology courses with industrial orientation.',
      displayOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
  });

  const catMedical = await prisma.programCategory.create({
    data: {
      name: 'Medical & Healthcare',
      slug: 'medical',
      description: 'Clinical medical sciences, general medicine, and specialized healthcare degrees.',
      displayOrder: 2,
      status: ContentStatus.PUBLISHED,
    },
  });

  const catParamedical = await prisma.programCategory.create({
    data: {
      name: 'Paramedical Sciences',
      slug: 'paramedical',
      description: 'Allied healthcare fields including Cardiac Care, Dialysis, Radiography, and Operation Theatre Tech.',
      displayOrder: 3,
      status: ContentStatus.PUBLISHED,
    },
  });

  const catNursing = await prisma.programCategory.create({
    data: {
      name: 'Nursing',
      slug: 'nursing',
      description: 'Professional nursing education programs recognized for clinical excellence.',
      displayOrder: 4,
      status: ContentStatus.PUBLISHED,
    },
  });

  const catPharmacy = await prisma.programCategory.create({
    data: {
      name: 'Pharmacy',
      slug: 'pharmacy',
      description: 'Pharmaceutical chemistry, pharmacology, and drug formulation studies.',
      displayOrder: 5,
      status: ContentStatus.PUBLISHED,
    },
  });

  const catManagement = await prisma.programCategory.create({
    data: {
      name: 'Management & Business Studies',
      slug: 'management',
      description: 'Undergraduate and postgraduate business leadership programs.',
      displayOrder: 6,
      status: ContentStatus.PUBLISHED,
    },
  });

  const catArtsScience = await prisma.programCategory.create({
    data: {
      name: 'Arts & Science',
      slug: 'arts-science',
      description: 'Pure sciences, commerce, literature, and humanities degrees.',
      displayOrder: 7,
      status: ContentStatus.PUBLISHED,
    },
  });

  const catIT = await prisma.programCategory.create({
    data: {
      name: 'IT & Computer Applications',
      slug: 'it-computer-science',
      description: 'Software development, cloud computing, cybersecurity, and data analytics.',
      displayOrder: 8,
      status: ContentStatus.PUBLISHED,
    },
  });

  const catDesign = await prisma.programCategory.create({
    data: {
      name: 'Design & Architecture',
      slug: 'design',
      description: 'Visual communication, fashion technology, and spatial design.',
      displayOrder: 9,
      status: ContentStatus.PUBLISHED,
    },
  });

  // 3. SEED REALISTIC SAMPLE PROGRAMS
  console.log('🎓 Seeding realistic academic programs...');
  const progCSE = await prisma.program.create({
    data: {
      categoryId: catEngineering.id,
      name: 'B.E. Computer Science & Engineering',
      slug: 'be-computer-science-and-engineering',
      degreeLevel: 'Undergraduate',
      durationYears: '4 Years',
      overview: 'Comprehensive program covering algorithms, software architecture, full-stack systems, AI, and systems engineering.',
      eligibilityCriteria: 'Pass in 12th standard (HSC) with Physics, Chemistry, and Mathematics (minimum 50% aggregate).',
      careerOpportunities: 'Software Engineer, Cloud Architect, Systems Analyst, AI Developer.',
      imageUrl: '/brand/poster-01.png',
      displayOrder: 1,
      isPublished: true,
    },
  });

  const progCardiac = await prisma.program.create({
    data: {
      categoryId: catParamedical.id,
      name: 'B.Sc. Cardiac Technology',
      slug: 'bsc-cardiac-technology',
      degreeLevel: 'Undergraduate',
      durationYears: '3 Years + 1 Year Internship',
      overview: 'Allied medical technology discipline specializing in invasive and non-invasive cardiovascular diagnostic instrumentation.',
      eligibilityCriteria: 'Pass in 12th standard with Physics, Chemistry, and Biology (PCB).',
      careerOpportunities: 'Cardiac Technologist, Cath Lab Specialist, Clinical Applications Specialist.',
      imageUrl: '/brand/poster-02.png',
      displayOrder: 2,
      isPublished: true,
    },
  });

  const progNursing = await prisma.program.create({
    data: {
      categoryId: catNursing.id,
      name: 'B.Sc. Nursing',
      slug: 'bsc-nursing',
      degreeLevel: 'Undergraduate',
      durationYears: '4 Years',
      overview: 'Accredited clinical nursing degree integrating hospital rotations, pediatric care, surgical assistance, and community healthcare.',
      eligibilityCriteria: 'Pass in 12th with Physics, Chemistry, and Biology (minimum 45% aggregate) with English.',
      careerOpportunities: 'Registered Staff Nurse, Critical Care Specialist, Healthcare Administrator.',
      imageUrl: '/brand/poster-03.png',
      displayOrder: 3,
      isPublished: true,
    },
  });

  const progBPharm = await prisma.program.create({
    data: {
      categoryId: catPharmacy.id,
      name: 'B.Pharm - Bachelor of Pharmacy',
      slug: 'b-pharm-bachelor-of-pharmacy',
      degreeLevel: 'Undergraduate',
      durationYears: '4 Years',
      overview: 'PCI-approved pharmaceutical science curriculum covering pharmacology, drug analysis, and industrial pharmacy.',
      eligibilityCriteria: 'Pass in 12th standard with PCB or PCM.',
      careerOpportunities: 'Clinical Pharmacist, Quality Assurance Analyst, Drug Inspector.',
      displayOrder: 4,
      isPublished: true,
    },
  });

  const progBBA = await prisma.program.create({
    data: {
      categoryId: catManagement.id,
      name: 'BBA - Bachelor of Business Administration',
      slug: 'bba-bachelor-of-business-administration',
      degreeLevel: 'Undergraduate',
      durationYears: '3 Years',
      overview: 'Foundational business administration curriculum emphasizing marketing, financial accounting, human resources, and entrepreneurship.',
      eligibilityCriteria: 'Pass in 12th standard in any stream.',
      careerOpportunities: 'Business Analyst, Marketing Executive, Operations Coordinator.',
      displayOrder: 5,
      isPublished: true,
    },
  });

  // 4. SEED SAMPLE STUDENTS & ADMISSION ENQUIRIES
  console.log('📋 Seeding sample students and enquiries...');
  // Student 1 (Assigned)
  const student1 = await prisma.student.create({
    data: {
      firstName: 'Aravindhan',
      phone: '9840123456',
      email: 'aravindhan.demo@example.com',
      address: '42 Gandhi Road, RS Puram',
      district: 'Coimbatore',
      areaOfInterest: 'Engineering & Technology',
      programId: progCSE.id,
      mark12th: '88.5%',
      consentGiven: true,
      aadhaarMasked: 'XXXXXXXX1234', // Demo masked representation
    },
  });

  const enquiry1 = await prisma.admissionEnquiry.create({
    data: {
      enquiryCode: 'SG-2026-00101',
      studentId: student1.id,
      programId: progCSE.id,
      source: EnquirySource.ADMISSION_QUERY,
      status: EnquiryStatus.ASSIGNED,
      assignedCounselorId: counselor1.id,
      internalNotes: '[Demo Note] Student interested in top Tier-1 autonomous engineering colleges in Coimbatore.',
    },
  });

  // Student 2 (In Counseling)
  const student2 = await prisma.student.create({
    data: {
      firstName: 'Deepika',
      phone: '9876543211',
      email: 'deepika.demo@example.com',
      address: '15 Anna Nagar 2nd Avenue',
      district: 'Chennai',
      areaOfInterest: 'Paramedical Sciences',
      programId: progCardiac.id,
      mark12th: '92.0%',
      consentGiven: true,
      aadhaarMasked: 'XXXXXXXX5678',
    },
  });

  const enquiry2 = await prisma.admissionEnquiry.create({
    data: {
      enquiryCode: 'SG-2026-00102',
      studentId: student2.id,
      programId: progCardiac.id,
      source: EnquirySource.HOME_HERO,
      status: EnquiryStatus.COUNSELING,
      assignedCounselorId: counselor2.id,
      internalNotes: '[Demo Note] Evaluated B.Sc. Cardiac Technology vs Perfusion Technology. Counseling session completed.',
    },
  });

  // Student 3 (New Unassigned Enquiry)
  const student3 = await prisma.student.create({
    data: {
      firstName: 'Manojkumar',
      phone: '9789012345',
      email: 'manoj.demo@example.com',
      address: '88 South Veli Street',
      district: 'Madurai',
      areaOfInterest: 'Pharmacy',
      programId: progBPharm.id,
      mark12th: '76.4%',
      consentGiven: true,
    },
  });

  await prisma.admissionEnquiry.create({
    data: {
      enquiryCode: 'SG-2026-00103',
      studentId: student3.id,
      programId: progBPharm.id,
      source: EnquirySource.PROGRAM_PAGE,
      status: EnquiryStatus.NEW,
      internalNotes: '[Demo Note] Direct enquiry submitted via Pharmacy course page. Pending counselor assignment.',
    },
  });

  // Student 4 (Follow-up Due)
  const student4 = await prisma.student.create({
    data: {
      firstName: 'Sangeetha',
      phone: '9443219876',
      email: 'sangeetha.demo@example.com',
      address: '12 Fairlands Colony',
      district: 'Salem',
      areaOfInterest: 'Nursing',
      programId: progNursing.id,
      mark12th: '84.2%',
      consentGiven: true,
    },
  });

  const enquiry4 = await prisma.admissionEnquiry.create({
    data: {
      enquiryCode: 'SG-2026-00104',
      studentId: student4.id,
      programId: progNursing.id,
      source: EnquirySource.ENQUIRY,
      status: EnquiryStatus.FOLLOW_UP,
      assignedCounselorId: counselor1.id,
      internalNotes: '[Demo Note] Student needs fee structure comparison between Salem and Coimbatore nursing colleges.',
    },
  });

  // Student 5 (Converted)
  const student5 = await prisma.student.create({
    data: {
      firstName: 'Harish',
      phone: '9841239870',
      email: 'harish.demo@example.com',
      address: '27 Thillai Nagar',
      district: 'Tiruchirappalli',
      areaOfInterest: 'Management & Business Studies',
      programId: progBBA.id,
      mark12th: '90.1%',
      consentGiven: true,
    },
  });

  await prisma.admissionEnquiry.create({
    data: {
      enquiryCode: 'SG-2026-00105',
      studentId: student5.id,
      programId: progBBA.id,
      source: EnquirySource.COUNSELING,
      status: EnquiryStatus.CONVERTED,
      assignedCounselorId: counselor2.id,
      internalNotes: '[Demo Note] Successfully enrolled into BBA program. Application verified.',
    },
  });

  // 5. SEED FOLLOW-UPS
  console.log('📅 Seeding actionable follow-up tasks...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.followUp.create({
    data: {
      enquiryId: enquiry4.id,
      studentId: student4.id,
      counselorId: counselor1.id,
      scheduledAt: tomorrow,
      status: FollowUpStatus.SCHEDULED,
      feedbackNote: '[Demo Follow-up] Call parent with detailed hostel and tuition fee schedules for B.Sc. Nursing.',
      nextActionDate: tomorrow,
    },
  });

  // 6. SEED CONVERSATIONS & TIMELINE ENTRIES
  console.log('💬 Seeding student conversation history...');
  const conv2 = await prisma.conversation.create({
    data: {
      enquiryId: enquiry2.id,
      studentId: student2.id,
      title: 'Cardiac Technology Consultation',
    },
  });

  await prisma.conversationMessage.create({
    data: {
      conversationId: conv2.id,
      senderId: counselor2.id,
      channel: InteractionChannel.PHONE,
      message: '[Demo Interaction] Conducted initial phone counselling. Explained 3+1 year curriculum and hospital internship requirements. Student and parent are comfortable with Chennai institutions.',
    },
  });

  await prisma.conversationMessage.create({
    data: {
      conversationId: conv2.id,
      senderId: counselor2.id,
      channel: InteractionChannel.WHATSAPP,
      message: '[Demo Interaction] Shared verified prospectus and eligibility cut-off summary via WhatsApp with student acknowledgment.',
    },
  });

  // 7. SEED NEWS CMS
  console.log('📰 Seeding news articles...');
  await prisma.news.create({
    data: {
      title: 'Higher Education Admissions 2026-27: Key Preparation Tips for 12th Students',
      slug: 'higher-education-admissions-2026-27-preparation-tips',
      category: 'Admission Guidance',
      excerpt: 'Essential steps every student must take after 12th standard results to secure seats in accredited engineering and medical programs.',
      content: `Choosing the right collegiate path requires understanding course eligibility, university accreditations, and emerging employment landscapes. Shasthi Guru Dream Campus counselors advise students to review seat matrices, merit quotas, and counseling timelines early.\n\nDemonstration content prepared for Shasthi Guru Dream Campus testing environment.`,
      coverImage: '/brand/poster-01.png',
      isPublished: true,
      authorId: contentManager.id,
    },
  });

  await prisma.news.create({
    data: {
      title: 'Emerging Career Opportunities in Paramedical Sciences and Allied Healthcare',
      slug: 'emerging-career-opportunities-paramedical-sciences',
      category: 'Career Insights',
      excerpt: 'Healthcare infrastructure growth has increased the demand for certified cardiac, radiography, and dialysis technologists across India and abroad.',
      content: `Paramedical disciplines bridge patient care with modern medical diagnostic technologies. Programs like B.Sc. Cardiac Technology, Physician Assistant, and Medical Laboratory Technology provide dependable clinical pathways.\n\nDemonstration content prepared for Shasthi Guru Dream Campus testing environment.`,
      coverImage: '/brand/poster-02.png',
      isPublished: true,
      authorId: contentManager.id,
    },
  });

  // 8. SEED IMPACT STATISTICS (Demonstration Data)
  console.log('📊 Seeding impact statistics...');
  await prisma.impactStatistic.createMany({
    data: [
      {
        metricKey: 'STUDENTS_GUIDED',
        numberLabel: '5,000+',
        title: 'Students Guided (Demo)',
        description: 'Comprehensive academic counselling sessions delivered across Tamil Nadu.',
        displayOrder: 1,
        status: ContentStatus.PUBLISHED,
      },
      {
        metricKey: 'COLLEGES_PARTNERED',
        numberLabel: '120+',
        title: 'Colleges & Universities (Demo)',
        description: 'Verified educational institutions across Engineering, Medical, and Arts.',
        displayOrder: 2,
        status: ContentStatus.PUBLISHED,
      },
      {
        metricKey: 'COUNSELING_SATISFACTION',
        numberLabel: '98%',
        title: 'Guidance Satisfaction (Demo)',
        description: 'Demonstration metric reflecting parent and student consultation feedback.',
        displayOrder: 3,
        status: ContentStatus.PUBLISHED,
      },
      {
        metricKey: 'DISTRICTS_SERVED',
        numberLabel: '38',
        title: 'Districts Reached (Demo)',
        description: 'Students supported from all districts across Tamil Nadu and neighboring regions.',
        displayOrder: 4,
        status: ContentStatus.PUBLISHED,
      },
    ],
  });

  // 9. SEED AUDIT LOG
  console.log('🔒 Seeding initial audit trail...');
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'SYSTEM_INITIALIZED',
      entity: 'Platform',
      entityId: 'SYSTEM',
      details: 'Initial database schema and development demonstration dataset created.',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('✅ Shasthi Guru Dream Campus database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
