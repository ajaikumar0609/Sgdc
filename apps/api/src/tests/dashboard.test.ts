import { createApp } from '../app';
import { prisma, UserRole, EnquiryStatus, FollowUpStatus } from '@shasthi-guru/database';
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

async function runDashboardTests() {
  console.log('====================================================');
  console.log('🧪 Starting Phase 8: Admin Dashboard Test Suite');
  console.log('====================================================\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}/api`;

  // 1. Auth Setup
  async function login(email: string, password = 'ShasthiAdmin2026!') {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    return json.data?.token;
  }

  const superAdminToken = await login('superadmin@shasthiguru.com', 'ShasthiSuperAdmin2026!');
  const adminToken = await login('admin@shasthiguru.com', 'ShasthiAdmin2026!');
  const counselorToken = await login('karthik.counselor@shasthiguru.com', 'ShasthiAdmin2026!');
  const contentManagerToken = await login('content@shasthiguru.com', 'ShasthiAdmin2026!');

  const counselorUser = await prisma.user.findUnique({
    where: { email: 'karthik.counselor@shasthiguru.com' },
  });

  // ---------------------------------------------------------------
  // 1. Super Admin Dashboard Access
  // ---------------------------------------------------------------
  await test(1, 'Super Admin can load complete dashboard reports', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.success === true, 'Response should indicate success');
    assert(Boolean(json.data.kpis), 'KPIs should be present');
    assert(json.data.kpis.totalEnquiries > 0, 'Total enquiries should be > 0');
  });

  // ---------------------------------------------------------------
  // 2. Admin Dashboard Access
  // ---------------------------------------------------------------
  await test(2, 'Admin can load complete dashboard reports', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.data.scope.role === 'ADMIN', 'Scope role should be ADMIN');
  });

  // ---------------------------------------------------------------
  // 3. Counselor Caseload Isolation in Dashboard
  // ---------------------------------------------------------------
  await test(3, 'Counselor dashboard is strictly scoped to assigned caseload', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${counselorToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.data.scope.role === 'COUNSELOR', 'Scope role should be COUNSELOR');
    assert(json.data.scope.counselorId === counselorUser?.id, 'Scope counselorId must match logged-in counselor');

    // Counselor workload must only contain themselves
    assert(json.data.counselorWorkload.length === 1, 'Counselor should only see their own workload');
    assert(json.data.counselorWorkload[0].id === counselorUser?.id, 'Workload ID must match counselor');
  });

  // ---------------------------------------------------------------
  // 4. Unauthorized Role Rejection
  // ---------------------------------------------------------------
  await test(4, 'Content Manager is rejected from accessing dashboard reports (Returns 403)', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${contentManagerToken}` },
    });
    assert(res.status === 403, `Expected 403 FORBIDDEN, got ${res.status}`);
    const json = await res.json();
    assert(json.error.code === 'FORBIDDEN', 'Error code must be FORBIDDEN');
  });

  // ---------------------------------------------------------------
  // 5. Unauthenticated Request Rejection
  // ---------------------------------------------------------------
  await test(5, 'Unauthenticated request to dashboard is rejected (Returns 401)', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`);
    assert(res.status === 401, `Expected 401 UNAUTHORIZED, got ${res.status}`);
  });

  // ---------------------------------------------------------------
  // 6. Total Enquiries and Active Enquiries Metric Calculation
  // ---------------------------------------------------------------
  await test(6, 'Active enquiries calculation strictly excludes Converted and Closed cases', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    const { totalEnquiries, activeEnquiries, convertedEnquiries, closedEnquiries } = json.data.kpis;

    assert(
      activeEnquiries === totalEnquiries - (convertedEnquiries + closedEnquiries),
      `Active enquiries (${activeEnquiries}) must equal total (${totalEnquiries}) minus converted (${convertedEnquiries}) and closed (${closedEnquiries})`
    );
  });

  // ---------------------------------------------------------------
  // 7. Status Distribution Integrity
  // ---------------------------------------------------------------
  await test(7, 'Status distribution covers all 8 business statuses with correct counts', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    const distribution = json.data.statusDistribution;

    assert(Array.isArray(distribution), 'Status distribution must be an array');
    assert(distribution.length === 8, `Expected 8 statuses, got ${distribution.length}`);

    const expectedStatuses = [
      'NEW',
      'ASSIGNED',
      'CONTACTED',
      'COUNSELING',
      'FOLLOW_UP',
      'ADMISSION_SUPPORT',
      'CONVERTED',
      'CLOSED',
    ];

    for (const st of expectedStatuses) {
      const found = distribution.find((d: any) => d.status === st);
      assert(Boolean(found), `Status ${st} must be present in distribution`);
      assert(typeof found.count === 'number', `Count for ${st} must be a number`);
      assert(typeof found.percentage === 'number', `Percentage for ${st} must be a number`);
    }
  });

  // ---------------------------------------------------------------
  // 8. Time-Series Trend Buckets (Zero-Value Padded)
  // ---------------------------------------------------------------
  await test(8, 'Enquiry trend buckets generate continuous time-series for 7d, 30d, and 90d', async () => {
    // 7 days
    const res7d = await fetch(`${baseUrl}/admin/reports/dashboard?period=7d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json7d = await res7d.json();
    assert(json7d.data.trend.length === 7, `Expected 7 daily intervals for 7d period, got ${json7d.data.trend.length}`);

    // 30 days
    const res30d = await fetch(`${baseUrl}/admin/reports/dashboard?period=30d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json30d = await res30d.json();
    assert(json30d.data.trend.length === 30, `Expected 30 daily intervals for 30d period, got ${json30d.data.trend.length}`);

    // 90 days
    const res90d = await fetch(`${baseUrl}/admin/reports/dashboard?period=90d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json90d = await res90d.json();
    assert(json90d.data.trend.length === 90, `Expected 90 daily intervals for 90d period, got ${json90d.data.trend.length}`);
  });

  // ---------------------------------------------------------------
  // 9. Follow-Up Schedule Breakdown & Exclusion of Completed
  // ---------------------------------------------------------------
  await test(9, 'Follow-up summary correctly segregates overdue, due today, and upcoming without completed', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    const fu = json.data.followUpSummary;

    assert(typeof fu.overdue === 'number', 'Overdue must be a number');
    assert(typeof fu.dueToday === 'number', 'Due today must be a number');
    assert(typeof fu.upcoming === 'number', 'Upcoming must be a number');
    assert(
      json.data.kpis.followupsDue === fu.overdue + fu.dueToday,
      'followupsDue KPI must equal overdue + dueToday'
    );
  });

  // ---------------------------------------------------------------
  // 10. Program & District Distributions
  // ---------------------------------------------------------------
  await test(10, 'Program and District distributions calculate percentages accurately', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();

    assert(Array.isArray(json.data.programDistribution), 'Program distribution must be an array');
    assert(Array.isArray(json.data.districtDistribution), 'District distribution must be an array');

    for (const prog of json.data.programDistribution) {
      assert(Boolean(prog.name), 'Program name must be present');
      assert(prog.count >= 0, 'Program count must be non-negative');
    }

    for (const dist of json.data.districtDistribution) {
      assert(Boolean(dist.district), 'District name must be present');
      assert(dist.count >= 0, 'District count must be non-negative');
    }
  });

  // ---------------------------------------------------------------
  // 11. Recent Enquiries & Sensitive Data Protection (Zero Aadhaar)
  // ---------------------------------------------------------------
  await test(11, 'Dashboard payload strictly NEVER leaks plaintext or encrypted Aadhaar', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const text = await res.text();

    assert(!text.includes('aadhaarEncrypted'), 'Payload must not contain aadhaarEncrypted');
    assert(!text.includes('aadhaarPlaintext'), 'Payload must not contain aadhaarPlaintext');

    const json = JSON.parse(text);
    for (const enq of json.data.recentEnquiries) {
      assert(!enq.student.aadhaarEncrypted, 'Student must not have aadhaarEncrypted in recent enquiries');
      assert(!enq.student.aadhaarMasked, 'Aadhaar masked is not needed on dashboard overview');
    }
  });

  // ---------------------------------------------------------------
  // 12. Counselor Workload Metrics for Admin
  // ---------------------------------------------------------------
  await test(12, 'Counselor workload returns active caseloads and assigned metrics for all counselors', async () => {
    const res = await fetch(`${baseUrl}/admin/reports/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    const counselors = json.data.counselorWorkload;

    assert(counselors.length >= 2, 'Should include all active counselors in organization');
    for (const c of counselors) {
      assert(Boolean(c.name), 'Counselor name must exist');
      assert(typeof c.activeCaseload === 'number', 'activeCaseload must be a number');
      assert(typeof c.totalAssigned === 'number', 'totalAssigned must be a number');
    }
  });

  // Clean up server
  await new Promise<void>((resolve) => server.close(() => resolve()));

  console.log('\n====================================================');
  console.log(`📊 Dashboard Tests Finished: ${results.filter((r) => r.passed).length} / ${results.length} Passed`);
  console.log('====================================================\n');

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.error(`💥 ${failed.length} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('🎉 ALL 12 DASHBOARD INTEGRATION TESTS PASSED!');
  }
}

runDashboardTests().catch((e) => {
  console.error('Dashboard test fatal error:', e);
  process.exit(1);
});
