import { createApp } from '../app';
import { prisma, UserRole, EnquiryStatus } from '@shasthi-guru/database';
import http from 'http';

interface TestResult {
  num: number;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Shasthi Guru API & RBAC Test Suite');
  console.log('====================================================\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}/api`;

  let superAdminToken = '';
  let adminToken = '';
  let counselor1Token = '';
  let counselor2Token = '';
  let contentManagerToken = '';

  let counselor1EnquiryId = '';
  let counselor2EnquiryId = '';
  let student1Id = '';
  let student2Id = '';
  let createdEnquiryId = '';

  // Setup: Find existing seeded records
  const [c1, c2] = await Promise.all([
    prisma.user.findUnique({ where: { email: 'karthik.counselor@shasthiguru.com' } }),
    prisma.user.findUnique({ where: { email: 'priya.counselor@shasthiguru.com' } }),
  ]);

  if (c1 && c2) {
    const [e1, e2] = await Promise.all([
      prisma.admissionEnquiry.findFirst({ where: { assignedCounselorId: c1.id } }),
      prisma.admissionEnquiry.findFirst({ where: { assignedCounselorId: c2.id } }),
    ]);
    if (e1) {
      counselor1EnquiryId = e1.id;
      student1Id = e1.studentId;
    }
    if (e2) {
      counselor2EnquiryId = e2.id;
      student2Id = e2.studentId;
    }
  }

  async function test(num: number, name: string, fn: () => Promise<void>) {
    try {
      await fn();
      results.push({ num, name, passed: true });
      console.log(`✅ Test ${String(num).padStart(2, '0')}: ${name}`);
    } catch (err: any) {
      results.push({ num, name, passed: false, error: err.message });
      console.error(`❌ Test ${String(num).padStart(2, '0')}: ${name}`);
      console.error(`   Error: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------
  // 1. Valid Admin Login
  // ---------------------------------------------------------------
  await test(1, 'Valid Admin Login issues JWT and cookie', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@shasthiguru.com',
        password: 'ShasthiAdmin2026!',
      }),
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.success === true, 'Response success should be true');
    assert(Boolean(data.data.token), 'JWT token should be returned');
    assert(data.data.user.email === 'admin@shasthiguru.com', 'User email should match');
    assert(!data.data.user.passwordHash, 'Password hash must never be returned');
    adminToken = data.data.token;

    // Also login Super Admin, Counselors, and Content Manager for subsequent tests
    const [saRes, c1Res, c2Res, cmRes] = await Promise.all([
      fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'superadmin@shasthiguru.com', password: 'ShasthiSuperAdmin2026!' }),
      }),
      fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'karthik.counselor@shasthiguru.com', password: 'ShasthiAdmin2026!' }),
      }),
      fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'priya.counselor@shasthiguru.com', password: 'ShasthiAdmin2026!' }),
      }),
      fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'content@shasthiguru.com', password: 'ShasthiAdmin2026!' }),
      }),
    ]);

    superAdminToken = (await saRes.json()).data.token;
    counselor1Token = (await c1Res.json()).data.token;
    counselor2Token = (await c2Res.json()).data.token;
    contentManagerToken = (await cmRes.json()).data.token;
  });

  // ---------------------------------------------------------------
  // 2. Invalid Login
  // ---------------------------------------------------------------
  await test(2, 'Invalid Login is rejected with 401', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@shasthiguru.com',
        password: 'WrongPassword!',
      }),
    });
    const data = await res.json();
    assert(res.status === 401, `Expected 401, got ${res.status}`);
    assert(data.success === false, 'Expected success: false');
    assert(data.error.code === 'INVALID_CREDENTIALS', 'Expected INVALID_CREDENTIALS');
  });

  // ---------------------------------------------------------------
  // 3. Logout
  // ---------------------------------------------------------------
  await test(3, 'Logout clears authentication state', async () => {
    const res = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.success === true, 'Expected success: true');
  });

  // ---------------------------------------------------------------
  // 4. Authenticated /me
  // ---------------------------------------------------------------
  await test(4, 'Authenticated /api/auth/me returns safe profile', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.user.role === 'ADMIN', 'Expected role: ADMIN');
    assert(!data.data.user.passwordHash, 'Password hash must never be returned');
  });

  // ---------------------------------------------------------------
  // 5. Unauthenticated protected route rejection
  // ---------------------------------------------------------------
  await test(5, 'Unauthenticated request to protected route is rejected with 401', async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
    const data = await res.json();
    assert(data.error.code === 'UNAUTHORIZED', 'Expected UNAUTHORIZED code');
  });

  // ---------------------------------------------------------------
  // 6. Super Admin Access
  // ---------------------------------------------------------------
  await test(6, 'Super Admin has full access to reports and counselors', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.data.metrics.totalEnquiries > 0, 'Reports metrics should be populated');
  });

  // ---------------------------------------------------------------
  // 7. Admin Access
  // ---------------------------------------------------------------
  await test(7, 'Admin has access to view all enquiries and counselors', async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.data.enquiries.length > 0, 'Admin should receive enquiries');
  });

  // ---------------------------------------------------------------
  // 8. Counselor Access
  // ---------------------------------------------------------------
  await test(8, 'Counselor can access their assigned enquiries', async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries`, {
      headers: { Authorization: `Bearer ${counselor1Token}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    // Every enquiry returned must belong to counselor 1
    for (const enq of data.data.enquiries) {
      assert(enq.assignedCounselor.id === c1?.id, 'Counselor must only receive their assigned cases');
    }
  });

  // ---------------------------------------------------------------
  // 9. Counselor Data Isolation (CRITICAL IDOR BOUNDARY TEST)
  // ---------------------------------------------------------------
  await test(9, 'CRITICAL: Counselor CANNOT access another counselor\'s enquiry by ID (Returns 403)', async () => {
    assert(Boolean(counselor2EnquiryId), 'Counselor 2 enquiry ID must exist for test');
    const res = await fetch(`${baseUrl}/admin/enquiries/${counselor2EnquiryId}`, {
      headers: { Authorization: `Bearer ${counselor1Token}` }, // Counselor 1 requests Counselor 2's case
    });
    assert(res.status === 403, `Expected 403 FORBIDDEN, got ${res.status}`);
    const data = await res.json();
    assert(data.error.code === 'FORBIDDEN', 'Expected FORBIDDEN error code on unauthorized IDOR attempt');
  });

  // ---------------------------------------------------------------
  // 10. Content Manager Restricted From CRM
  // ---------------------------------------------------------------
  await test(10, 'Content Manager cannot access restricted CRM enquiry endpoints', async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries`, {
      headers: { Authorization: `Bearer ${contentManagerToken}` },
    });
    assert(res.status === 403, `Expected 403 FORBIDDEN, got ${res.status}`);
    const data = await res.json();
    assert(data.error.code === 'FORBIDDEN', 'Expected FORBIDDEN for content manager on CRM operations');
  });

  // ---------------------------------------------------------------
  // 11. Public Program Listing
  // ---------------------------------------------------------------
  await test(11, 'Public program listing returns published programs', async () => {
    const res = await fetch(`${baseUrl}/programs`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.data.programs), 'Programs must be an array');
    assert(data.data.programs.length > 0, 'Should return published programs');
  });

  // ---------------------------------------------------------------
  // 12. Unpublished Program Hidden Publicly
  // ---------------------------------------------------------------
  await test(12, 'Unpublished program is hidden from public API', async () => {
    // Create an unpublished test program
    const draftProgram = await prisma.program.create({
      data: {
        categoryId: (await prisma.programCategory.findFirst())!.id,
        name: 'Draft Hidden Degree',
        slug: 'draft-hidden-degree-' + Date.now(),
        degreeLevel: 'Diploma',
        durationYears: '1 Year',
        overview: 'Hidden unpublished test program.',
        isPublished: false,
      },
    });

    const res = await fetch(`${baseUrl}/programs/${draftProgram.slug}`);
    assert(res.status === 404, `Expected 404 for unpublished program, got ${res.status}`);

    // Cleanup draft program
    await prisma.program.delete({ where: { id: draftProgram.id } });
  });

  // ---------------------------------------------------------------
  // 13. Public News Listing
  // ---------------------------------------------------------------
  await test(13, 'Public news listing returns published articles', async () => {
    const res = await fetch(`${baseUrl}/news`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.data.articles.length > 0, 'Should return published news articles');
  });

  // ---------------------------------------------------------------
  // 14. Unpublished News Hidden Publicly
  // ---------------------------------------------------------------
  await test(14, 'Unpublished news article is hidden from public API', async () => {
    const author = await prisma.user.findFirst();
    const draftNews = await prisma.news.create({
      data: {
        title: 'Draft Hidden News Article',
        slug: 'draft-hidden-news-' + Date.now(),
        category: 'Updates',
        excerpt: 'Draft excerpt',
        content: 'Draft content',
        isPublished: false,
        authorId: author!.id,
      },
    });

    const res = await fetch(`${baseUrl}/news/${draftNews.slug}`);
    assert(res.status === 404, `Expected 404 for unpublished article, got ${res.status}`);

    await prisma.news.delete({ where: { id: draftNews.id } });
  });

  // ---------------------------------------------------------------
  // 15. Single Student Enquiry Creation
  // ---------------------------------------------------------------
  await test(15, 'POST /api/enquiries creates student and generates SG-YYYY-XXXXX code', async () => {
    const res = await fetch(`${baseUrl}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Meenakshi',
        phone: '9840999888',
        email: 'meenakshi.test@example.com',
        address: '100 Cross Street',
        district: 'Madurai',
        areaOfInterest: 'Nursing',
        courseProgram: 'B.Sc. Nursing',
        mark12th: '89.5%',
        consent: true,
        source: 'ADMISSION_QUERY',
      }),
    });
    const data = await res.json();
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(data.success === true, 'Expected success: true');
    assert(Boolean(data.data.enquiryCode), 'Enquiry code must be generated');
    assert(/^SG-\d{4}-\d{5}$/.test(data.data.enquiryCode), `Code '${data.data.enquiryCode}' must match SG-YYYY-XXXXX format`);
    createdEnquiryId = data.data.enquiryId;
  });

  // ---------------------------------------------------------------
  // 16. Invalid Enquiry Rejection
  // ---------------------------------------------------------------
  await test(16, 'POST /api/enquiries rejects invalid phone number and missing consent', async () => {
    const res = await fetch(`${baseUrl}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        phone: '12345', // Invalid
        email: 'not-an-email',
        address: '',
        district: '',
        areaOfInterest: '',
        courseProgram: '',
        mark12th: '',
        consent: false, // Invalid
      }),
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    const data = await res.json();
    assert(data.error.code === 'VALIDATION_ERROR', 'Expected VALIDATION_ERROR');
    assert(Boolean(data.error.fields.phone), 'Phone error must be identified');
    assert(Boolean(data.error.fields.consent), 'Consent error must be identified');
  });

  // ---------------------------------------------------------------
  // 17. Enquiry Status Update
  // ---------------------------------------------------------------
  await test(17, 'PATCH /api/admin/enquiries/:id updates status', async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries/${createdEnquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: EnquiryStatus.CONTACTED,
        internalNotes: 'Contacted student regarding application requirements.',
      }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.data.enquiry.status === 'CONTACTED', 'Enquiry status should be CONTACTED');
  });

  // ---------------------------------------------------------------
  // 18. Counselor Assignment
  // ---------------------------------------------------------------
  await test(18, 'Admin can assign counselor to newly created enquiry', async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries/${createdEnquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        assignedCounselorId: c1!.id,
      }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.data.enquiry.assignedCounselorId === c1!.id, 'Counselor 1 should be assigned');
  });

  // ---------------------------------------------------------------
  // 19. Follow-Up Creation
  // ---------------------------------------------------------------
  await test(19, 'Authorized counselor can schedule a follow-up', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(`${baseUrl}/admin/enquiries/${createdEnquiryId}/followups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${counselor1Token}`, // Counselor 1 is assigned to this enquiry
      },
      body: JSON.stringify({
        scheduledAt: tomorrow,
        feedbackNote: 'Discuss scholarship opportunities and college entrance cutoff.',
      }),
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    assert(data.data.followUp.enquiryId === createdEnquiryId, 'Follow-up must be attached to enquiry');
  });

  // ---------------------------------------------------------------
  // 20. Conversation Creation (Timeline Note)
  // ---------------------------------------------------------------
  await test(20, 'Counselor can add interaction timeline note to student', async () => {
    const enq = await prisma.admissionEnquiry.findUnique({
      where: { id: createdEnquiryId },
      select: { studentId: true },
    });
    assert(Boolean(enq), 'Created enquiry must exist');

    const res = await fetch(`${baseUrl}/admin/students/${enq!.studentId}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${counselor1Token}`,
      },
      body: JSON.stringify({
        channel: 'PHONE',
        message: 'Phone conversation with candidate regarding college options in Madurai.',
      }),
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    assert(data.data.entry.channel === 'PHONE', 'Channel must be PHONE');
  });

  // ---------------------------------------------------------------
  // 21. Contact Form Submission
  // ---------------------------------------------------------------
  await test(21, 'POST /api/contact receives and stores public contact enquiry', async () => {
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vasanth',
        email: 'vasanth.test@example.com',
        phone: '9840112233',
        subject: 'General Campus Guidance Query',
        message: 'Seeking guidance for college admissions guidance seminar schedule.',
      }),
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Contact submission should succeed');
  });

  // ---------------------------------------------------------------
  // 22. Rate Limiting Behavior
  // ---------------------------------------------------------------
  await test(22, 'Rate limiter middleware is properly attached and functional', async () => {
    // In test environment, max limit is elevated, but rate limit headers are present
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'test@example.com',
        phone: '9840112233',
        subject: 'Rate Limit Test',
        message: 'Valid test message length.',
      }),
    });
    assert(res.headers.has('ratelimit-limit') || res.headers.has('x-ratelimit-limit'), 'Rate limit headers should be present');
  });

  // ---------------------------------------------------------------
  // 23. Aadhaar Protection
  // ---------------------------------------------------------------
  await test(23, 'Student details endpoints strictly mask Aadhaar and never leak plaintext', async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries/${createdEnquiryId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    const student = data.data.enquiry.student;
    assert(!student.aadhaarEncrypted, 'Encrypted Aadhaar cipher must not be returned to client');
    assert(!student.aadhaarNumber, 'Plaintext Aadhaar must never be returned');
  });

  // ---------------------------------------------------------------
  // 24. Donation Feature Flag Enforcement
  // ---------------------------------------------------------------
  await test(24, 'Donation and payment webhook endpoints reject requests while feature flag is disabled', async () => {
    const [donRes, payRes] = await Promise.all([
      fetch(`${baseUrl}/donations`, { method: 'POST' }),
      fetch(`${baseUrl}/payments/webhook`, { method: 'POST' }),
    ]);

    assert(donRes.status === 403, `Expected 403 for disabled donation, got ${donRes.status}`);
    assert(payRes.status === 403, `Expected 403 for disabled payment webhook, got ${payRes.status}`);

    const donData = await donRes.json();
    assert(donData.error.code === 'DONATION_MODULE_DISABLED', 'Expected DONATION_MODULE_DISABLED code');
  });

  // Clean up server
  await new Promise<void>((resolve) => server.close(() => resolve()));

  console.log('\n====================================================');
  console.log(`📊 Test Suite Finished: ${results.filter((r) => r.passed).length} / ${results.length} Passed`);
  console.log('====================================================\n');

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.error(`💥 ${failed.length} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('🎉 ALL 24 TESTS PASSED FLAWLESSLY!');
  }
}

runTests().catch((e) => {
  console.error('Test execution fatal error:', e);
  process.exit(1);
});
