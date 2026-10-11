-- ============================================================================
-- SHASTHI GURU DREAM CAMPUS - SUPABASE DATABASE SETUP & SEED SCRIPT
-- Paste this entire script into your Supabase SQL Editor and click "Run"
-- https://supabase.com/dashboard/project/bxtjatqrwlumbkdwaffb/sql/new
-- ============================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'COUNSELOR', 'CONTENT_MANAGER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'ASSIGNED', 'CONTACTED', 'COUNSELING', 'FOLLOW_UP', 'ADMISSION_SUPPORT', 'CONVERTED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EnquirySource" AS ENUM ('HOME_HERO', 'ADMISSION_PAGE', 'ADMISSION_QUERY', 'PROGRAM_PAGE', 'COUNSELING', 'ENQUIRY', 'CONTACT', 'DIRECT', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "FollowUpStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "InteractionChannel" AS ENUM ('PHONE', 'WHATSAPP', 'IN_PERSON', 'EMAIL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ContactStatus" AS ENUM ('UNREAD', 'READ', 'RESPONDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DonationStatus" AS ENUM ('INITIATED', 'PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('ENQUIRY_NEW', 'ENQUIRY_ASSIGNED', 'FOLLOWUP_DUE', 'SYSTEM_ALERT', 'GENERAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'COUNSELOR',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "program_categories" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "icon" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "programs" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "category_id" TEXT NOT NULL REFERENCES "program_categories"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "degree_level" TEXT NOT NULL,
    "duration_years" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "eligibility_criteria" TEXT,
    "career_opportunities" TEXT,
    "image_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "students" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "first_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "area_of_interest" TEXT NOT NULL,
    "program_id" TEXT REFERENCES "programs"("id") ON DELETE SET NULL,
    "mark_12th" TEXT NOT NULL,
    "consent_given" BOOLEAN NOT NULL DEFAULT true,
    "consent_given_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aadhaar_encrypted" TEXT,
    "aadhaar_masked" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "admission_enquiries" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "enquiry_code" TEXT NOT NULL UNIQUE,
    "student_id" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
    "program_id" TEXT REFERENCES "programs"("id") ON DELETE SET NULL,
    "source" "EnquirySource" NOT NULL DEFAULT 'ENQUIRY',
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "assigned_counselor_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "follow_ups" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "enquiry_id" TEXT NOT NULL REFERENCES "admission_enquiries"("id") ON DELETE CASCADE,
    "student_id" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
    "counselor_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "status" "FollowUpStatus" NOT NULL DEFAULT 'SCHEDULED',
    "feedback_note" TEXT,
    "next_action_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "conversations" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "enquiry_id" TEXT NOT NULL REFERENCES "admission_enquiries"("id") ON DELETE CASCADE,
    "student_id" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "conversation_messages" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "conversation_id" TEXT NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
    "sender_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "channel" "InteractionChannel" NOT NULL DEFAULT 'PHONE',
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "news" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "category" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "contact_enquiries" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'UNREAD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "impact_statistics" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "metric_key" TEXT NOT NULL UNIQUE,
    "number_label" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "donations" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "donor_name" TEXT NOT NULL,
    "donor_email" TEXT NOT NULL,
    "donor_phone" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "support_category" TEXT NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'INITIATED',
    "receipt_number" TEXT UNIQUE,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "donation_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "donation_id" TEXT NOT NULL REFERENCES "donations"("id") ON DELETE CASCADE,
    "gateway_reference" TEXT,
    "gateway_name" TEXT NOT NULL DEFAULT 'MOCK_GATEWAY',
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "raw_response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "recipient_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" "NotificationType" NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "details" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "student_stories" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "student_name" TEXT NOT NULL,
    "program" TEXT,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. SEED INITIAL USERS (Admin & Counselors)
-- Password for Admin/Counselor: ShasthiAdmin2026!
-- Password for Super Admin: ShasthiSuperAdmin2026!

INSERT INTO "users" ("id", "name", "email", "password_hash", "role", "status", "phone")
VALUES
  ('u-superadmin-01', 'System Administrator (Demo)', 'superadmin@shasthiguru.com', '$2a$10$0HZXwzigWg6MLQ2sJp9nIutZbLAfO2Sneb4rQAWVV3cpbmsozzNle', 'SUPER_ADMIN', 'ACTIVE', '+91 98400 00001'),
  ('u-admin-02', 'Ananya Ramanathan (Admin)', 'admin@shasthiguru.com', '$2a$10$FViJxQtWMREOY.M3oucf9Ok1h1d15m./t5RKxQjHWbz3b8Gi5Ynze', 'ADMIN', 'ACTIVE', '+91 98400 00002'),
  ('u-counselor-03', 'Karthik Subramanian (Lead Counselor)', 'karthik.counselor@shasthiguru.com', '$2a$10$FViJxQtWMREOY.M3oucf9Ok1h1d15m./t5RKxQjHWbz3b8Gi5Ynze', 'COUNSELOR', 'ACTIVE', '+91 98400 00003'),
  ('u-counselor-04', 'Priya Sundaram (Education Counselor)', 'priya.counselor@shasthiguru.com', '$2a$10$FViJxQtWMREOY.M3oucf9Ok1h1d15m./t5RKxQjHWbz3b8Gi5Ynze', 'COUNSELOR', 'ACTIVE', '+91 98400 00004'),
  ('u-counselor-05', 'Rajesh Kannan (Counselor)', 'counselor.rajesh@shasthiguru.com', '$2a$10$FViJxQtWMREOY.M3oucf9Ok1h1d15m./t5RKxQjHWbz3b8Gi5Ynze', 'COUNSELOR', 'ACTIVE', '+91 98400 00006'),
  ('u-content-06', 'Vignesh Kumar (Content Lead)', 'content@shasthiguru.com', '$2a$10$FViJxQtWMREOY.M3oucf9Ok1h1d15m./t5RKxQjHWbz3b8Gi5Ynze', 'CONTENT_MANAGER', 'ACTIVE', '+91 98400 00005')
ON CONFLICT ("email") DO UPDATE SET
  "password_hash" = EXCLUDED."password_hash",
  "status" = 'ACTIVE';

-- 4. SEED PROGRAM CATEGORIES
INSERT INTO "program_categories" ("id", "name", "slug", "description", "display_order", "status")
VALUES
  ('cat-eng', 'Engineering & Technology', 'engineering', 'Undergraduate and postgraduate technology courses.', 1, 'PUBLISHED'),
  ('cat-med', 'Medical & Healthcare', 'medical', 'Clinical medical sciences, MBBS, and specialized degrees.', 2, 'PUBLISHED'),
  ('cat-para', 'Paramedical Sciences', 'paramedical', 'Cardiac Care, Dialysis, Radiography, and Operation Theatre Tech.', 3, 'PUBLISHED'),
  ('cat-nurse', 'Nursing', 'nursing', 'Accredited clinical nursing degree programs.', 4, 'PUBLISHED'),
  ('cat-pharm', 'Pharmacy', 'pharmacy', 'Pharmaceutical chemistry, pharmacology, and drug formulation.', 5, 'PUBLISHED'),
  ('cat-mgmt', 'Management & Business Studies', 'management', 'Undergraduate and postgraduate business leadership.', 6, 'PUBLISHED'),
  ('cat-arts', 'Arts & Science', 'arts-science', 'Pure sciences, commerce, literature, and humanities.', 7, 'PUBLISHED')
ON CONFLICT ("slug") DO NOTHING;

-- 5. SEED PROGRAMS
INSERT INTO "programs" ("id", "category_id", "name", "slug", "degree_level", "duration_years", "overview", "eligibility_criteria", "career_opportunities", "image_url", "display_order", "is_published")
VALUES
  ('prog-cse', 'cat-eng', 'B.E. Computer Science & Engineering', 'be-computer-science-and-engineering', 'Undergraduate', '4 Years', 'Comprehensive program covering algorithms, software architecture, full-stack systems, AI, and systems engineering.', 'Pass in 12th standard (HSC) with Physics, Chemistry, and Mathematics (minimum 50% aggregate).', 'Software Engineer, Cloud Architect, Systems Analyst, AI Developer.', '/brand/poster-01.png', 1, true),
  ('prog-cardiac', 'cat-para', 'B.Sc. Cardiac Technology', 'bsc-cardiac-technology', 'Undergraduate', '3 Years + 1 Year Internship', 'Allied medical technology discipline specializing in invasive and non-invasive cardiovascular diagnostic instrumentation.', 'Pass in 12th standard with Physics, Chemistry, and Biology (PCB).', 'Cardiac Technologist, Cath Lab Specialist.', '/brand/poster-02.png', 2, true),
  ('prog-nursing', 'cat-nurse', 'B.Sc. Nursing', 'bsc-nursing', 'Undergraduate', '4 Years', 'Accredited clinical nursing degree integrating hospital rotations and community healthcare.', 'Pass in 12th with PCB (minimum 45% aggregate) with English.', 'Registered Staff Nurse, Critical Care Specialist.', '/brand/poster-03.png', 3, true),
  ('prog-pharm', 'cat-pharm', 'B.Pharm - Bachelor of Pharmacy', 'b-pharm-bachelor-of-pharmacy', 'Undergraduate', '4 Years', 'PCI-approved pharmaceutical science curriculum covering pharmacology and drug analysis.', 'Pass in 12th standard with PCB or PCM.', 'Clinical Pharmacist, Drug Inspector.', '/brand/poster-01.png', 4, true)
ON CONFLICT ("slug") DO NOTHING;

-- 6. SEED IMPACT METRICS
INSERT INTO "impact_statistics" ("id", "metric_key", "number_label", "title", "description", "display_order", "status")
VALUES
  ('stat-1', 'STUDENTS_GUIDED', '5,000+', 'Students Guided', 'Comprehensive academic counselling sessions delivered.', 1, 'PUBLISHED'),
  ('stat-2', 'COLLEGES_PARTNERED', '120+', 'Colleges & Universities', 'Verified educational institutions across Engineering, Medical, and Arts.', 2, 'PUBLISHED'),
  ('stat-3', 'COUNSELING_SATISFACTION', '98%', 'Guidance Satisfaction', 'Parent and student consultation feedback satisfaction rate.', 3, 'PUBLISHED'),
  ('stat-4', 'DISTRICTS_SERVED', '38', 'Districts Reached', 'Students supported from all districts across Tamil Nadu and neighboring regions.', 4, 'PUBLISHED')
ON CONFLICT ("metric_key") DO NOTHING;
