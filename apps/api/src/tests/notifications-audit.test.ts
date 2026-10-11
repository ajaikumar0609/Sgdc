import { createApp } from '../app';
import { prisma, UserRole, NotificationType } from '@shasthi-guru/database';
import http from 'http';
import { env } from '../config/env';

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
  } catch (error: any) {
    results.push({ num, name, passed: false, error: error.message });
    console.error(`❌ Test ${num}: ${name}`);
    console.error(`   Error: ${error.message}`);
  }
}

async function fetchJson(port: number, path: string, options: any = {}) {
  return new Promise<any>((resolve, reject) => {
    const req = http.request(
      `http://localhost:${port}${path}`,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              body: data ? JSON.parse(data) : null,
            });
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

let superAdminToken = '';
let counselorToken = '';
let superAdminId = '';

async function runTests() {
  const app = createApp();
  let server: http.Server | undefined;
  let port = 0;

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      port = (server!.address() as any).port;
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // Setup Phase
    // -------------------------------------------------------------
    const superAdmin = await prisma.user.findFirst({
      where: { role: UserRole.SUPER_ADMIN },
    });
    const counselor = await prisma.user.findFirst({
      where: { role: UserRole.COUNSELOR },
    });
    
    if (superAdmin && counselor) {
      const jwt = require('jsonwebtoken');
      superAdminId = superAdmin.id;
      superAdminToken = jwt.sign(
        { userId: superAdmin.id, email: superAdmin.email, role: superAdmin.role },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      counselorToken = jwt.sign(
        { userId: counselor.id, email: counselor.email, role: counselor.role },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    }

    // -------------------------------------------------------------
    // NOTIFICATIONS TESTS (Phase 13)
    // -------------------------------------------------------------
    console.log('\n--- Running Notifications Tests ---');

    // Create a mock notification for testing
    const testNotif = await prisma.notification.create({
      data: {
        recipientId: superAdminId,
        type: NotificationType.SYSTEM_ALERT,
        title: 'Test Notification',
        message: 'This is a test notification.',
        isRead: false
      }
    });

    await test(1, 'Fetch authenticated user notifications', async () => {
      const res = await fetchJson(port, '/api/admin/notifications', {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      assert(res.status === 200, 'Expected 200 OK');
      assert(res.body.success === true, 'Expected success: true');
      assert(Array.isArray(res.body.data.notifications), 'Expected array of notifications');
      const found = res.body.data.notifications.find((n: any) => n.id === testNotif.id);
      assert(found !== undefined, 'Test notification should be in list');
      assert(found.isRead === false, 'Notification should be unread initially');
    });

    await test(2, 'Mark notification as read', async () => {
      const res = await fetchJson(port, `/api/admin/notifications/${testNotif.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      assert(res.status === 200, 'Expected 200 OK');
      assert(res.body.success === true, 'Expected success: true');

      const updated = await prisma.notification.findUnique({ where: { id: testNotif.id } });
      assert(updated?.isRead === true, 'Database record should be updated to read');
      assert(updated?.readAt !== null, 'Read timestamp should be set');
    });

    await test(3, 'Mark notification as unread', async () => {
      const res = await fetchJson(port, `/api/admin/notifications/${testNotif.id}/unread`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      assert(res.status === 200, 'Expected 200 OK');
      assert(res.body.success === true, 'Expected success: true');

      const updated = await prisma.notification.findUnique({ where: { id: testNotif.id } });
      assert(updated?.isRead === false, 'Database record should be updated to unread');
      assert(updated?.readAt === null, 'Read timestamp should be cleared');
    });

    await test(4, 'Counselor cannot modify another users notification', async () => {
      const res = await fetchJson(port, `/api/admin/notifications/${testNotif.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${counselorToken}` }
      });
      assert(res.status === 404, 'Expected 404 Not Found (isolated by recipientId)');
    });

    // -------------------------------------------------------------
    // AUDIT LOG TESTS (Phase 13)
    // -------------------------------------------------------------
    console.log('\n--- Running Audit Log Tests ---');

    let testAuditId = '';

    await test(5, 'Fetch audit logs as SUPER_ADMIN', async () => {
      const res = await fetchJson(port, '/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      assert(res.status === 200, 'Expected 200 OK');
      assert(res.body.success === true, 'Expected success: true');
      assert(Array.isArray(res.body.data.logs), 'Expected array of logs');
      
      if (res.body.data.logs.length > 0) {
        testAuditId = res.body.data.logs[0].id;
      }
    });

    await test(6, 'Counselor is denied access to audit logs', async () => {
      const res = await fetchJson(port, '/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${counselorToken}` }
      });
      assert(res.status === 403, 'Expected 403 Forbidden for COUNSELOR role');
    });

    await test(7, 'Fetch single audit log detail', async () => {
      if (!testAuditId) return; // Skip if no audit logs exist
      const res = await fetchJson(port, `/api/admin/audit-logs/${testAuditId}`, {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      assert(res.status === 200, 'Expected 200 OK');
      assert(res.body.success === true, 'Expected success: true');
      assert(res.body.data.log.id === testAuditId, 'Mismatching audit log ID');
    });

    // Cleanup
    await prisma.notification.delete({ where: { id: testNotif.id } });

  } finally {
    server?.close();
    await prisma.$disconnect();
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n====================================================');
  console.log('📊 Notifications & Audit Tests Summary');
  console.log('====================================================');
  console.log(`Total Tests : ${results.length}`);
  console.log(`Passed      : ${passed}`);
  console.log(`Failed      : ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  - Test ${r.num}: ${r.name}`);
      console.log(`    Error: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 ALL Notifications & Audit tests passed flawlessly!\n');
    process.exit(0);
  }
}

runTests();
