import { createApp } from '../app';
import { prisma, UserRole, DonationStatus, PaymentStatus } from '@shasthi-guru/database';
import http from 'http';
import { env } from '../config/env';
import crypto from 'crypto';

function generateSignature(payload: any) {
  return crypto.createHmac('sha256', env.WEBHOOK_SECRET).update(JSON.stringify(payload)).digest('hex');
}

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

// Global tokens
let superAdminToken = '';

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
    
    if (superAdmin) {
      const jwt = require('jsonwebtoken');
      superAdminToken = jwt.sign(
        { userId: superAdmin.id, email: superAdmin.email, role: superAdmin.role },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    }

    // -------------------------------------------------------------
    // WELFARE TESTS (Phase 11)
    // -------------------------------------------------------------
    console.log('\n--- Running Welfare (Phase 11) Tests ---');

    await test(1, 'Fetch public impact stats', async () => {
      const res = await fetchJson(port, '/api/welfare/impact');
      assert(res.status === 200, 'Expected 200 OK');
      assert(res.body.success === true, 'Expected success: true');
      assert(Array.isArray(res.body.data.statistics), 'Expected array of statistics');
    });

    await test(2, 'Fetch public student stories', async () => {
      const res = await fetchJson(port, '/api/welfare/stories');
      assert(res.status === 200, 'Expected 200 OK');
      assert(res.body.success === true, 'Expected success: true');
      assert(Array.isArray(res.body.data.stories), 'Expected array of stories');
    });

    let createdStoryId = '';
    await test(3, 'Create student story as SUPER_ADMIN', async () => {
      const payload = {
        title: 'Overcoming Odds',
        studentName: 'Test Student',
        program: 'B.Sc Physics',
        content: 'This is a test story content.',
        displayOrder: 1,
        status: 'PUBLISHED'
      };

      const res = await fetchJson(port, '/api/admin/welfare/stories', {
        method: 'POST',
        headers: { Authorization: `Bearer ${superAdminToken}` },
        body: payload
      });

      assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
      assert(res.body.success === true, 'Expected success: true');
      createdStoryId = res.body.data.story.id;
    });

    await test(4, 'Public student stories includes newly created published story', async () => {
      const res = await fetchJson(port, '/api/welfare/stories');
      assert(res.status === 200, 'Expected 200 OK');
      const found = res.body.data.stories.find((s: any) => s.id === createdStoryId);
      assert(found !== undefined, 'Expected to find newly created published story');
    });

    await test(5, 'Delete student story', async () => {
      const res = await fetchJson(port, `/api/admin/welfare/stories/${createdStoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      assert(res.status === 200, 'Expected 200 OK');
      
      const checkRes = await fetchJson(port, `/api/admin/welfare/stories/${createdStoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      assert(checkRes.status === 404, 'Expected 404 Not Found after deletion');
    });


    // -------------------------------------------------------------
    // DONATION TESTS (Phase 12)
    // -------------------------------------------------------------
    console.log('\n--- Running Donation (Phase 12) Tests ---');
    
    // Enable donation flags temporarily for tests
    const originalDonationFlag = env.ENABLE_DONATION_MODULE;
    const originalGatewayFlag = env.ENABLE_PAYMENT_GATEWAY;
    
    (env as any).ENABLE_DONATION_MODULE = true;
    (env as any).ENABLE_PAYMENT_GATEWAY = true;

    let testDonationId = '';
    let testTransactionId = '';

    await test(6, 'Initiate donation request', async () => {
      const payload = {
        donorName: 'Generous Donor',
        donorEmail: 'donor@example.com',
        donorPhone: '9876543210',
        amount: 5000,
        supportCategory: 'Scholarships',
        isAnonymous: false
      };

      const res = await fetchJson(port, '/api/donations', {
        method: 'POST',
        body: payload
      });

      assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
      assert(res.body.success === true, 'Expected success: true');
      assert(res.body.data.donationId !== undefined, 'Expected donationId');
      assert(res.body.data.transactionId !== undefined, 'Expected transactionId');
      
      testDonationId = res.body.data.donationId;
      testTransactionId = res.body.data.transactionId;
    });

    await test(7, 'Process successful payment webhook', async () => {
      const payload = {
        transactionId: testTransactionId,
        status: 'SUCCESS',
        rawAmount: '5000',
        gatewayReference: 'GW-123456'
      };

      const res = await fetchJson(port, '/api/payments/webhook', {
        method: 'POST',
        headers: { 'x-provider-signature': generateSignature(payload) },
        body: payload
      });

      assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
      assert(res.body.success === true, 'Expected success: true');
      
      // Verify database state
      const tx = await prisma.donationTransaction.findUnique({ where: { id: testTransactionId } });
      assert(tx?.paymentStatus === PaymentStatus.COMPLETED, 'Transaction should be COMPLETED');
      
      const don = await prisma.donation.findUnique({ where: { id: testDonationId } });
      assert(don?.status === DonationStatus.SUCCESSFUL, 'Donation should be SUCCESSFUL');
      assert(don?.receiptNumber !== null, 'Should have receipt number');
    });

    await test(8, 'Reject webhook with amount mismatch', async () => {
      const payload2 = {
        donorName: 'Hacker',
        donorEmail: 'hack@example.com',
        amount: 10000,
        supportCategory: 'General'
      };
      
      const initRes = await fetchJson(port, '/api/donations', { method: 'POST', body: payload2 });
      const txId = initRes.body.data.transactionId;
      
      const webhookPayload = {
        transactionId: txId,
        status: 'SUCCESS',
        rawAmount: '50', // Mismatch!
        gatewayReference: 'GW-HACK'
      };

      const hookRes = await fetchJson(port, '/api/payments/webhook', {
        method: 'POST',
        headers: { 'x-provider-signature': generateSignature(webhookPayload) },
        body: webhookPayload
      });

      assert(hookRes.status === 400, 'Expected 400 Bad Request for amount mismatch');
      
      const tx = await prisma.donationTransaction.findUnique({ where: { id: txId } });
      assert(tx?.paymentStatus === PaymentStatus.FAILED, 'Transaction should be marked FAILED');
    });

    await test(9, 'Idempotent webhook processing', async () => {
      const payload = {
        transactionId: testTransactionId,
        status: 'SUCCESS',
        rawAmount: '5000',
        gatewayReference: 'GW-123456'
      };

      const res = await fetchJson(port, '/api/payments/webhook', {
        method: 'POST',
        headers: { 'x-provider-signature': generateSignature(payload) },
        body: payload
      });

      assert(res.status === 200, 'Expected 200 OK');
      assert(res.body.message === 'Webhook already processed.', 'Expected already processed message');
    });

    await test(10, 'Fetch admin donation records', async () => {
      const res = await fetchJson(port, '/api/admin/donations', {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      assert(res.status === 200, 'Expected 200 OK');
      assert(Array.isArray(res.body.data.donations), 'Expected array of donations');
      assert(res.body.data.donations.length >= 1, 'Expected at least one donation');
    });
    
    await test(11, 'Fetch single donation by ID', async () => {
      const res = await fetchJson(port, `/api/admin/donations/${testDonationId}`, {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      assert(res.status === 200, 'Expected 200 OK');
      assert(res.body.data.donation.id === testDonationId, 'ID mismatch');
      assert(Array.isArray(res.body.data.donation.transactions), 'Expected transactions array');
    });

    // Cleanup
    await prisma.donationTransaction.deleteMany({ where: { donationId: testDonationId } });
    await prisma.donation.delete({ where: { id: testDonationId } });

    // Restore flags
    (env as any).ENABLE_DONATION_MODULE = originalDonationFlag;
    (env as any).ENABLE_PAYMENT_GATEWAY = originalGatewayFlag;

  } finally {
    server?.close();
    await prisma.$disconnect();
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n====================================================');
  console.log('📊 Welfare & Donation Test Summary');
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
    console.log('\n🎉 ALL Welfare & Donation tests passed flawlessly!\n');
    process.exit(0);
  }
}

runTests();
