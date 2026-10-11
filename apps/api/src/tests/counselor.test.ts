import { createApp } from '../app';
import { prisma, UserRole, EnquiryStatus, FollowUpStatus, InteractionChannel } from '@shasthi-guru/database';
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

async function test(num: number, name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ num, name, passed: true });
    console.log(`✅ Test ${num}: ${name}`);
  } catch (err: any) {
    results.push({ num, name, passed: false, error: err.message });
    console.error(`❌ Test ${num}: ${name} - Failed: ${err.message}`);
  }
}

async function runCounselorTests() {
  console.log('====================================================');
  console.log('🧪 Starting Phase 9: Counselor Portal Test Suite');
  console.log('====================================================\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}/api`;

  // Auth Helper
  async function login(email: string, password = 'ShasthiAdmin2026!') {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    return json.data?.token;
  }

  // Tokens
  const counselorKarthikToken = await login('karthik.counselor@shasthiguru.com', 'ShasthiAdmin2026!');
  const counselorPriyaToken = await login('priya.counselor@shasthiguru.com', 'ShasthiAdmin2026!');
  const adminToken = await login('admin@shasthiguru.com', 'ShasthiAdmin2026!');
  const contentToken = await login('content@shasthiguru.com', 'ShasthiAdmin2026!');

  const karthikUser = await prisma.user.findUnique({
    where: { email: 'karthik.counselor@shasthiguru.com' },
  });
  const priyaUser = await prisma.user.findUnique({
    where: { email: 'priya.counselor@shasthiguru.com' },
  });

  assert(Boolean(karthikUser && priyaUser), 'Test counselors must exist in database');

  // Find an enquiry assigned to Karthik
  const karthikEnquiry = await prisma.admissionEnquiry.findFirst({
    where: { assignedCounselorId: karthikUser!.id },
    include: { student: true },
  });

  // Find an enquiry assigned to Priya
  const priyaEnquiry = await prisma.admissionEnquiry.findFirst({
    where: { assignedCounselorId: priyaUser!.id },
    include: { student: true },
  });

  assert(Boolean(karthikEnquiry), 'Karthik must have at least one assigned enquiry in seed data');
  assert(Boolean(priyaEnquiry), 'Priya must have at least one assigned enquiry in seed data');

  // ---------------------------------------------------------------
  // 1. Counselor Authentication & Session
  // ---------------------------------------------------------------
  await test(1, 'Counselor can log in and obtain valid JWT with COUNSELOR role', async () => {
    assert(Boolean(counselorKarthikToken), 'JWT token should be returned');
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${counselorKarthikToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.data.user.role === 'COUNSELOR', 'Role must be COUNSELOR');
    assert(json.data.user.email === 'karthik.counselor@shasthiguru.com', 'Email must match');
  });

  // ---------------------------------------------------------------
  // 2. Scoped Dashboard Metrics for Counselor
  // ---------------------------------------------------------------
  await test(2, 'Counselor dashboard metrics are strictly scoped to personal caseload', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${counselorKarthikToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();

    assert(json.data.scope.role === 'COUNSELOR', 'Scope must be COUNSELOR');
    assert(json.data.scope.counselorId === karthikUser!.id, 'Scope counselorId must match Karthik');
    assert(json.data.counselorWorkload.length === 1, 'Counselor workload array must contain only 1 entry');
    assert(json.data.counselorWorkload[0].id === karthikUser!.id, 'Workload record must be Karthik only');
  });

  // ---------------------------------------------------------------
  // 3. Admin Receives All Counselors (Confirming User Distinction)
  // ---------------------------------------------------------------
  await test(3, 'Admin dashboard receives organization-wide workload for all counselors', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();

    assert(json.data.scope.role === 'ADMIN', 'Scope must be ADMIN');
    assert(json.data.counselorWorkload.length >= 2, 'Admin must receive all counselors');
  });

  // ---------------------------------------------------------------
  // 4. Counselor Enquiry Queue Isolation
  // ---------------------------------------------------------------
  await test(4, 'Counselor enquiry queue shows only assigned enquiries', async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries?limit=50`, {
      headers: { Authorization: `Bearer ${counselorKarthikToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    const list = json.data.enquiries;

    assert(list.length > 0, 'Karthik should have enquiries returned');
    for (const enq of list) {
      assert(enq.assignedCounselor?.id === karthikUser!.id, 'Every enquiry must be assigned to Karthik');
      assert(enq.assignedCounselor?.id !== priyaUser!.id, 'No enquiry should belong to Priya');
    }
  });

  // ---------------------------------------------------------------
  // 5. Permitted Enquiry Details
  // ---------------------------------------------------------------
  await test(5, 'Counselor can open their own assigned enquiry workspace', async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries/${karthikEnquiry!.id}`, {
      headers: { Authorization: `Bearer ${counselorKarthikToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.data.enquiry.id === karthikEnquiry!.id, 'Enquiry ID must match');
    assert(json.data.enquiry.student.firstName === karthikEnquiry!.student.firstName, 'Student name must match');
  });

  // ---------------------------------------------------------------
  // 6. IDOR Guard: Counselor Cannot Access Other Counselor's Enquiry
  // ---------------------------------------------------------------
  await test(6, "Counselor cannot access another counselor's enquiry (Returns 403 Forbidden)", async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries/${priyaEnquiry!.id}`, {
      headers: { Authorization: `Bearer ${counselorKarthikToken}` },
    });
    assert(res.status === 403, `Expected 403 FORBIDDEN, got ${res.status}`);
    const json = await res.json();
    assert(json.error.code === 'FORBIDDEN', 'Error code must be FORBIDDEN');
  });

  // ---------------------------------------------------------------
  // 7. IDOR Guard: Counselor Cannot Access Other Counselor's Student
  // ---------------------------------------------------------------
  await test(7, "Counselor cannot access another counselor's student profile (Returns 403 Forbidden)", async () => {
    const res = await fetch(`${baseUrl}/admin/students/${priyaEnquiry!.studentId}`, {
      headers: { Authorization: `Bearer ${counselorKarthikToken}` },
    });
    assert(res.status === 403, `Expected 403 FORBIDDEN, got ${res.status}`);
    const json = await res.json();
    assert(json.error.code === 'FORBIDDEN', 'Error code must be FORBIDDEN');
  });

  // ---------------------------------------------------------------
  // 8. Authorization Guard: Counselor Cannot Reassign Counselor
  // ---------------------------------------------------------------
  await test(8, 'Counselor is forbidden from reassigning case to another counselor (Returns 403)', async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries/${karthikEnquiry!.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${counselorKarthikToken}`,
      },
      body: JSON.stringify({ assignedCounselorId: priyaUser!.id }),
    });
    assert(res.status === 403, `Expected 403 FORBIDDEN, got ${res.status}`);
  });

  // ---------------------------------------------------------------
  // 9. Status Progression: Counselor Can Update Permitted Status
  // ---------------------------------------------------------------
  await test(9, 'Counselor can update permitted status and internal notes on assigned case', async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries/${karthikEnquiry!.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${counselorKarthikToken}`,
      },
      body: JSON.stringify({
        status: EnquiryStatus.COUNSELING,
        internalNotes: 'Phase 9 Automated verification: Student actively counseled on engineering cutoff.',
      }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.data.enquiry.status === EnquiryStatus.COUNSELING, 'Status should be updated to COUNSELING');
    assert(json.data.enquiry.internalNotes.includes('Phase 9 Automated verification'), 'Notes should be updated');
  });

  // ---------------------------------------------------------------
  // 10. Follow-up Lifecycle: Counselor Can Schedule Follow-up
  // ---------------------------------------------------------------
  let createdFollowUpId = '';
  await test(10, 'Counselor can schedule a follow-up for assigned enquiry', async () => {
    const scheduledDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
    const res = await fetch(`${baseUrl}/admin/enquiries/${karthikEnquiry!.id}/followups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${counselorKarthikToken}`,
      },
      body: JSON.stringify({
        scheduledAt: scheduledDate,
        feedbackNote: 'Schedule call to discuss scholarship criteria and quota.',
      }),
    });
    assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
    const json = await res.json();
    assert(Boolean(json.data.followUp?.id), 'Follow-up ID should be returned');
    assert(json.data.followUp.counselorId === karthikUser!.id, 'Follow-up should be assigned to Karthik');
    createdFollowUpId = json.data.followUp.id;
  });

  // ---------------------------------------------------------------
  // 11. Follow-up IDOR Guard: Cannot Schedule on Another's Enquiry
  // ---------------------------------------------------------------
  await test(11, "Counselor cannot schedule follow-up on another counselor's enquiry (Returns 403)", async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries/${priyaEnquiry!.id}/followups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${counselorKarthikToken}`,
      },
      body: JSON.stringify({
        scheduledAt: new Date().toISOString(),
        feedbackNote: 'Unauthorized follow-up attempt',
      }),
    });
    assert(res.status === 403, `Expected 403 FORBIDDEN, got ${res.status}`);
  });

  // ---------------------------------------------------------------
  // 12. Follow-up Execution: Mark Completed & Record Outcome
  // ---------------------------------------------------------------
  await test(12, 'Counselor can complete a follow-up and record outcome notes', async () => {
    assert(Boolean(createdFollowUpId), 'createdFollowUpId must be available');
    const res = await fetch(`${baseUrl}/admin/follow-ups/${createdFollowUpId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${counselorKarthikToken}`,
      },
      body: JSON.stringify({
        status: FollowUpStatus.COMPLETED,
        feedbackNote: 'Consultation conducted successfully. Parent verified marks and scholarship eligibility.',
      }),
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.data.followUp.status === FollowUpStatus.COMPLETED, 'Follow-up status must be COMPLETED');
    assert(json.data.followUp.feedbackNote.includes('Parent verified marks'), 'Feedback note must be stored');
    assert(Boolean(json.data.followUp.completedAt), 'completedAt timestamp must be recorded');
  });

  // ---------------------------------------------------------------
  // 13. Follow-up IDOR Guard: Cannot Update Another's Follow-up
  // ---------------------------------------------------------------
  await test(13, "Counselor cannot update another counselor's follow-up record (Returns 403)", async () => {
    // Find or create a follow-up belonging to Priya
    let priyaFollowUp = await prisma.followUp.findFirst({
      where: { counselorId: priyaUser!.id },
    });
    if (!priyaFollowUp) {
      priyaFollowUp = await prisma.followUp.create({
        data: {
          enquiryId: priyaEnquiry!.id,
          studentId: priyaEnquiry!.studentId,
          counselorId: priyaUser!.id,
          scheduledAt: new Date(),
          status: FollowUpStatus.SCHEDULED,
        },
      });
    }

    const res = await fetch(`${baseUrl}/admin/follow-ups/${priyaFollowUp.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${counselorKarthikToken}`,
      },
      body: JSON.stringify({
        status: FollowUpStatus.COMPLETED,
        feedbackNote: 'Unauthorized completion attempt',
      }),
    });
    assert(res.status === 403, `Expected 403 FORBIDDEN, got ${res.status}`);
  });

  // ---------------------------------------------------------------
  // 14. Consultation Timeline: Log Interaction Across Channels
  // ---------------------------------------------------------------
  await test(14, 'Counselor can log interaction notes across channels (Phone, WhatsApp, In-Person)', async () => {
    const channels = [InteractionChannel.PHONE, InteractionChannel.WHATSAPP, InteractionChannel.IN_PERSON];

    for (const ch of channels) {
      const res = await fetch(`${baseUrl}/admin/students/${karthikEnquiry!.studentId}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${counselorKarthikToken}`,
        },
        body: JSON.stringify({
          channel: ch,
          message: `Consultation logged via channel ${ch} for verification.`,
          enquiryId: karthikEnquiry!.id,
        }),
      });
      assert(res.status === 201, `Expected 201 Created for ${ch}, got ${res.status}`);
      const json = await res.json();
      assert(json.data.entry.channel === ch, `Entry channel must be ${ch}`);
      assert(json.data.entry.sender.id === karthikUser!.id, 'Sender must be Karthik');
    }
  });

  // ---------------------------------------------------------------
  // 15. Conversation IDOR Guard: Cannot Log for Unassigned Student
  // ---------------------------------------------------------------
  await test(15, 'Counselor cannot log interaction for unassigned student (Returns 403)', async () => {
    const res = await fetch(`${baseUrl}/admin/students/${priyaEnquiry!.studentId}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${counselorKarthikToken}`,
      },
      body: JSON.stringify({
        channel: InteractionChannel.PHONE,
        message: 'Unauthorized communication logging attempt.',
        enquiryId: priyaEnquiry!.id,
      }),
    });
    assert(res.status === 403, `Expected 403 FORBIDDEN, got ${res.status}`);
  });

  // ---------------------------------------------------------------
  // 16. Privacy Guard: Zero Aadhaar or Secret Leakage in Responses
  // ---------------------------------------------------------------
  await test(16, 'Enquiry and student payloads never leak plaintext or raw encrypted Aadhaar', async () => {
    const res = await fetch(`${baseUrl}/admin/enquiries/${karthikEnquiry!.id}`, {
      headers: { Authorization: `Bearer ${counselorKarthikToken}` },
    });
    const text = await res.text();
    assert(!text.includes('aadhaarEncrypted'), 'aadhaarEncrypted must never be exposed');
    assert(!text.includes('aadhaarPlaintext'), 'aadhaarPlaintext must never be exposed');
    const json = JSON.parse(text);
    assert('aadhaarMasked' in json.data.enquiry.student, 'Only masked Aadhaar field is allowed');
  });

  // ---------------------------------------------------------------
  // 17. Notification Scoping for Counselor
  // ---------------------------------------------------------------
  await test(17, 'Notifications returned to counselor are strictly scoped to authenticated user', async () => {
    const res = await fetch(`${baseUrl}/admin/notifications`, {
      headers: { Authorization: `Bearer ${counselorKarthikToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    for (const notif of json.data.notifications) {
      assert(notif.recipientId === karthikUser!.id, 'Notification must belong to Karthik');
    }
  });

  // Clean up server
  await new Promise<void>((resolve) => server.close(() => resolve()));

  console.log('\n====================================================');
  console.log(`📊 Counselor Tests Finished: ${results.filter((r) => r.passed).length} / ${results.length} Passed`);
  console.log('====================================================\n');

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.error(`💥 ${failed.length} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('🎉 ALL 17 COUNSELOR WORKFLOW & ISOLATION TESTS PASSED!');
  }
}

runCounselorTests().catch((e) => {
  console.error('Counselor test fatal error:', e);
  process.exit(1);
});
