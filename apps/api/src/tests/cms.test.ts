import { createApp } from '../app';
import { prisma, UserRole } from '@shasthi-guru/database';
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

async function runCmsTests() {
  console.log('====================================================');
  console.log('🧪 Starting Phase 10: CMS Management Test Suite');
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

  assert(Boolean(superAdminToken), 'Failed to login as Super Admin');
  assert(Boolean(adminToken), 'Failed to login as Admin');
  assert(Boolean(counselorToken), 'Failed to login as Counselor');
  assert(Boolean(contentManagerToken), 'Failed to login as Content Manager');

  // Retrieve an existing category for testing
  const categoriesRes = await fetch(`${baseUrl}/admin/programs/categories`, {
    headers: { Authorization: `Bearer ${superAdminToken}` },
  });
  const categoriesJson = await categoriesRes.json();
  const testCategoryId = categoriesJson.data?.categories?.[0]?.id;
  assert(Boolean(testCategoryId), 'No program category found in database for testing');

  let createdProgramId: string = '';
  const testProgramSlug = `test-btech-cms-${Date.now()}`;
  let createdNewsId: string = '';
  const testNewsSlug = `test-admissions-alert-${Date.now()}`;

  // -------------------------------------------------------------
  // RBAC & PERMISSION TESTS
  // -------------------------------------------------------------

  await test(1, 'Super Admin can list programs via Admin CMS endpoint', async () => {
    const res = await fetch(`${baseUrl}/admin/programs`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.success === true, 'Response success should be true');
    assert(Array.isArray(json.data?.programs), 'Should return programs array');
  });

  await test(2, 'Admin role can list programs via Admin CMS endpoint', async () => {
    const res = await fetch(`${baseUrl}/admin/programs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.success === true, 'Admin should have access to CMS programs');
  });

  await test(3, 'Content Manager role can access authorized program management', async () => {
    const res = await fetch(`${baseUrl}/admin/programs`, {
      headers: { Authorization: `Bearer ${contentManagerToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.success === true, 'Content Manager should have access to CMS programs');
  });

  await test(4, 'Counselor is strictly forbidden from accessing CMS program endpoints (403)', async () => {
    const res = await fetch(`${baseUrl}/admin/programs`, {
      headers: { Authorization: `Bearer ${counselorToken}` },
    });
    assert(res.status === 403, `Expected 403 Forbidden for Counselor, got ${res.status}`);
  });

  await test(5, 'Public unauthenticated users cannot access administrative CMS endpoints (401)', async () => {
    const res = await fetch(`${baseUrl}/admin/programs`);
    assert(res.status === 401, `Expected 401 Unauthorized for public access, got ${res.status}`);
  });

  // -------------------------------------------------------------
  // PROGRAM CMS LIFECYCLE TESTS
  // -------------------------------------------------------------

  await test(6, 'Program creation persists to PostgreSQL database', async () => {
    const res = await fetch(`${baseUrl}/admin/programs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${contentManagerToken}`,
      },
      body: JSON.stringify({
        name: 'B.Tech Artificial Intelligence & Data Science (Test)',
        slug: testProgramSlug,
        categoryId: testCategoryId,
        degreeLevel: 'Undergraduate',
        durationYears: '4 Years',
        overview: 'Comprehensive AI & machine learning undergraduate curriculum designed for industry relevance.',
        eligibilityCriteria: 'Minimum 60% aggregate in Higher Secondary (10+2) with Physics, Chemistry, and Mathematics.',
        careerOpportunities: 'AI Research Scientist, ML Engineer, Big Data Architect, Business Intelligence Consultant.',
        imageUrl: '/brand/posters/poster-01.jpg',
        displayOrder: 10,
        isPublished: false, // Initially created as DRAFT
      }),
    });

    assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
    const json = await res.json();
    assert(json.success === true, 'Creation response should be true');
    assert(json.data?.program?.id, 'Program should have an ID');
    assert(json.data?.program?.slug === testProgramSlug, 'Slug should match');
    assert(json.data?.program?.isPublished === false, 'Should be draft');

    createdProgramId = json.data.program.id;

    // Verify in database directly
    const dbProgram = await prisma.program.findUnique({
      where: { id: createdProgramId },
    });
    assert(Boolean(dbProgram), 'Program must exist in PostgreSQL');
    assert(dbProgram?.name === 'B.Tech Artificial Intelligence & Data Science (Test)', 'Name must match DB record');
  });

  await test(7, 'Duplicate program slugs are rejected with 400 DUPLICATE_SLUG', async () => {
    const res = await fetch(`${baseUrl}/admin/programs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${contentManagerToken}`,
      },
      body: JSON.stringify({
        name: 'Another Program With Same Slug',
        slug: testProgramSlug,
        categoryId: testCategoryId,
        overview: 'Duplicate test',
      }),
    });

    assert(res.status === 400, `Expected 400, got ${res.status}`);
    const json = await res.json();
    assert(json.error?.code === 'DUPLICATE_SLUG', `Expected DUPLICATE_SLUG code, got ${json.error?.code}`);
  });

  await test(8, 'Program category relationship validation rejects invalid category IDs', async () => {
    const res = await fetch(`${baseUrl}/admin/programs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Program With Invalid Category',
        slug: `invalid-cat-${Date.now()}`,
        categoryId: 'non-existent-category-id-999',
        overview: 'Invalid category test',
      }),
    });

    assert(res.status === 400, `Expected 400, got ${res.status}`);
    const json = await res.json();
    assert(json.error?.code === 'INVALID_CATEGORY', `Expected INVALID_CATEGORY, got ${json.error?.code}`);
  });

  await test(9, 'Unpublished draft program does NOT appear in public catalog or public slug route', async () => {
    // Check public list
    const listRes = await fetch(`${baseUrl}/programs`);
    assert(listRes.status === 200, 'Public programs endpoint should return 200');
    const listJson = await listRes.json();
    const foundInList = (listJson.data?.programs || []).some((p: any) => p.slug === testProgramSlug);
    assert(!foundInList, 'Draft program MUST NOT appear in public program list');

    // Check public detail route
    const detailRes = await fetch(`${baseUrl}/programs/${testProgramSlug}`);
    assert(detailRes.status === 404, `Public detail for draft program should return 404, got ${detailRes.status}`);
  });

  await test(10, 'Draft preview endpoint returns draft program to authorized staff', async () => {
    const res = await fetch(`${baseUrl}/admin/programs/${createdProgramId}`, {
      headers: { Authorization: `Bearer ${contentManagerToken}` },
    });
    assert(res.status === 200, `Expected 200 for staff preview, got ${res.status}`);
    const json = await res.json();
    assert(json.data?.program?.slug === testProgramSlug, 'Should return the draft program');
    assert(json.data?.program?.isPublished === false, 'isPublished should be false');
  });

  await test(11, 'Program publication update sets isPublished to true', async () => {
    const res = await fetch(`${baseUrl}/admin/programs/${createdProgramId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${contentManagerToken}`,
      },
      body: JSON.stringify({
        isPublished: true,
        overview: 'Updated overview: comprehensive AI & machine learning undergraduate curriculum with lab access.',
      }),
    });

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.data?.program?.isPublished === true, 'isPublished should now be true');
    assert(json.data?.program?.overview.includes('with lab access'), 'Overview should be updated');
  });

  await test(12, 'Published program appears immediately on public API endpoints', async () => {
    // Check public detail
    const detailRes = await fetch(`${baseUrl}/programs/${testProgramSlug}`);
    assert(detailRes.status === 200, `Expected 200 for published program, got ${detailRes.status}`);
    const detailJson = await detailRes.json();
    assert(detailJson.data?.program?.name === 'B.Tech Artificial Intelligence & Data Science (Test)', 'Name must match');
    assert(detailJson.data?.program?.overview.includes('with lab access'), 'Public detail must show updated content');
  });

  await test(13, 'Unpublishing a program takes it off public catalog and returns 404', async () => {
    const unpubRes = await fetch(`${baseUrl}/admin/programs/${createdProgramId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ isPublished: false }),
    });
    assert(unpubRes.status === 200, `Expected 200, got ${unpubRes.status}`);

    const detailRes = await fetch(`${baseUrl}/programs/${testProgramSlug}`);
    assert(detailRes.status === 404, `Unpublished program must return 404 publicly, got ${detailRes.status}`);
  });

  // -------------------------------------------------------------
  // NEWS CMS LIFECYCLE TESTS
  // -------------------------------------------------------------

  await test(14, 'News creation persists to PostgreSQL database with author association', async () => {
    const res = await fetch(`${baseUrl}/admin/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${contentManagerToken}`,
      },
      body: JSON.stringify({
        title: 'Shasthi Guru Academic Scholarship Announcement 2026',
        slug: testNewsSlug,
        category: 'Scholarships',
        excerpt: 'Announcing 100% tuition assistance scholarships for eligible rural students in Tamil Nadu.',
        content: 'Shasthi Guru Educational Trust is proud to announce the 2026 Merit and Means Scholarship scheme. Application deadlines and verification centres are now active across Madurai and southern districts.',
        coverImage: '/brand/posters/poster-02.jpg',
        isPublished: false, // DRAFT initially
      }),
    });

    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const json = await res.json();
    assert(json.success === true, 'News creation should succeed');
    assert(json.data?.article?.id, 'Article should have ID');
    assert(json.data?.article?.slug === testNewsSlug, 'Slug should match');
    assert(json.data?.article?.author?.name === 'Vignesh Kumar (Content Lead)', 'Author should be attributed');

    createdNewsId = json.data.article.id;

    // Direct DB check
    const dbArticle = await prisma.news.findUnique({
      where: { id: createdNewsId },
      include: { author: true },
    });
    assert(Boolean(dbArticle), 'Article must exist in DB');
    assert(dbArticle?.author?.role === UserRole.CONTENT_MANAGER, 'Author must be Content Manager');
  });

  await test(15, 'Duplicate news slugs are rejected with 400 DUPLICATE_SLUG', async () => {
    const res = await fetch(`${baseUrl}/admin/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${contentManagerToken}`,
      },
      body: JSON.stringify({
        title: 'Duplicate Slug Article',
        slug: testNewsSlug,
        category: 'Admissions',
        excerpt: 'Testing duplicate slug handling',
        content: 'Content here',
      }),
    });

    assert(res.status === 400, `Expected 400, got ${res.status}`);
    const json = await res.json();
    assert(json.error?.code === 'DUPLICATE_SLUG', `Expected DUPLICATE_SLUG, got ${json.error?.code}`);
  });

  await test(16, 'Malicious or javascript: image URLs are rejected with 400 INVALID_IMAGE_URL', async () => {
    const res = await fetch(`${baseUrl}/admin/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${contentManagerToken}`,
      },
      body: JSON.stringify({
        title: 'Article with XSS Image URL',
        slug: `xss-image-${Date.now()}`,
        category: 'Admissions',
        excerpt: 'Security test',
        content: 'Content testing',
        coverImage: 'javascript:alert(1)',
      }),
    });

    assert(res.status === 400, `Expected 400, got ${res.status}`);
    const json = await res.json();
    assert(json.error?.code === 'INVALID_IMAGE_URL', `Expected INVALID_IMAGE_URL, got ${json.error?.code}`);
  });

  await test(17, 'Unpublished news article does NOT appear in public news catalog or article route', async () => {
    // Check public list
    const listRes = await fetch(`${baseUrl}/news`);
    assert(listRes.status === 200, 'Public news endpoint should return 200');
    const listJson = await listRes.json();
    const foundInList = (listJson.data?.articles || []).some((a: any) => a.slug === testNewsSlug);
    assert(!foundInList, 'Draft article MUST NOT appear in public news list');

    // Check public detail route
    const detailRes = await fetch(`${baseUrl}/news/${testNewsSlug}`);
    assert(detailRes.status === 404, `Public detail for draft news should return 404, got ${detailRes.status}`);
  });

  await test(18, 'News editing updates article content and publication status', async () => {
    const res = await fetch(`${baseUrl}/admin/news/${createdNewsId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${contentManagerToken}`,
      },
      body: JSON.stringify({
        title: 'Shasthi Guru Academic Scholarship Announcement 2026 (Updated & Published)',
        isPublished: true,
      }),
    });

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.data?.article?.isPublished === true, 'Article should now be published');
    assert(json.data?.article?.title.includes('(Updated & Published)'), 'Title should be updated');
  });

  await test(19, 'Published news article renders immediately on public API endpoints', async () => {
    const res = await fetch(`${baseUrl}/news/${testNewsSlug}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(json.data?.article?.title.includes('Updated & Published'), 'Public article must reflect updated content');
    assert(json.data?.article?.author?.name, 'Author info should be included');
  });

  // -------------------------------------------------------------
  // AUDIT LOGGING VERIFICATION
  // -------------------------------------------------------------

  await test(20, 'CMS lifecycle operations record structured audit events in PostgreSQL', async () => {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { entityId: createdProgramId },
          { entityId: createdNewsId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    assert(auditLogs.length >= 2, `Expected at least 2 audit entries, found ${auditLogs.length}`);

    const programActions = auditLogs.filter((l) => l.entityId === createdProgramId).map((l) => l.action);
    const newsActions = auditLogs.filter((l) => l.entityId === createdNewsId).map((l) => l.action);

    assert(programActions.includes('PROGRAM_CREATED'), 'Should have logged PROGRAM_CREATED');
    assert(programActions.includes('PROGRAM_PUBLISHED'), 'Should have logged PROGRAM_PUBLISHED');
    assert(newsActions.includes('NEWS_CREATED'), 'Should have logged NEWS_CREATED');
    assert(newsActions.includes('NEWS_PUBLISHED'), 'Should have logged NEWS_PUBLISHED');
  });

  // -------------------------------------------------------------
  // CATEGORY MANAGEMENT TESTS
  // -------------------------------------------------------------

  await test(21, 'Program category creation persists via CMS category endpoint', async () => {
    const catSlug = `test-vocational-${Date.now()}`;
    const res = await fetch(`${baseUrl}/admin/programs/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Vocational & Applied Sciences (Test)',
        slug: catSlug,
        description: 'Industry-integrated diplomas and technical training courses.',
      }),
    });

    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const json = await res.json();
    assert(json.data?.category?.name === 'Vocational & Applied Sciences (Test)', 'Category name should match');

    // Clean up test category
    await prisma.programCategory.delete({ where: { id: json.data.category.id } });
  });

  // -------------------------------------------------------------
  // CLEANUP / SAFE TEARDOWN
  // -------------------------------------------------------------

  await test(22, 'Safe deletion of test program and news article with audit logging', async () => {
    // Delete test program
    const delProgRes = await fetch(`${baseUrl}/admin/programs/${createdProgramId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(delProgRes.status === 200, `Expected 200 on delete program, got ${delProgRes.status}`);

    // Delete test news
    const delNewsRes = await fetch(`${baseUrl}/admin/news/${createdNewsId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(delNewsRes.status === 200, `Expected 200 on delete news, got ${delNewsRes.status}`);

    // Verify deletion audit
    const deleteAudit = await prisma.auditLog.findMany({
      where: {
        action: { in: ['PROGRAM_DELETED', 'NEWS_DELETED'] },
        entityId: { in: [createdProgramId, createdNewsId] },
      },
    });
    assert(deleteAudit.length === 2, `Expected 2 delete audit logs, found ${deleteAudit.length}`);
  });

  server.close();

  // Print Summary
  console.log('\n====================================================');
  console.log('📊 Phase 10: CMS Management Test Summary');
  console.log('====================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total Tests : ${results.length}`);
  console.log(`Passed      : ${passed}`);
  console.log(`Failed      : ${failed}`);

  if (failed > 0) {
    console.error('\n❌ Failures detected:');
    results.filter((r) => !r.passed).forEach((r) => console.error(`  - Test ${r.num}: ${r.name} (${r.error})`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL Phase 10 CMS tests passed flawlessly!\n');
    process.exit(0);
  }
}

runCmsTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
