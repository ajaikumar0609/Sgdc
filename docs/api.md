# Shasthi Guru Dream Campus — API Architecture & RBAC Reference

This document provides the authoritative API specification for the Shasthi Guru Dream Campus platform backend.

## 1. Authentication & Session Architecture

- **Mechanism**: JSON Web Token (JWT) signed with `HS256`.
- **Storage**: Set in an `HttpOnly`, `SameSite=Lax`, `Secure` (in production) cookie named `shasthi_guru_auth`.
- **Bearer Token Support**: Also accepts `Authorization: Bearer <token>` for headless API clients and testing.
- **Expiration**: 7 days.
- **Password Security**: Passwords are never stored in plaintext. Uses `bcrypt` with salt work factor 10.

---

## 2. Role-Based Access Control (RBAC) Matrix

| User Role | Global Enquiries | Assigned Enquiries | Counselor Reassignment | Programs & News CMS | System Settings & Audit Logs |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `SUPER_ADMIN` | Full Access | Full Access | Yes | Yes | Full Access |
| `ADMIN` | Full Access | Full Access | Yes | Yes | Read-only |
| `COUNSELOR` | Denied (403) | Full Access | Denied (403) | Denied (403) | Denied (403) |
| `CONTENT_MANAGER`| Denied (403) | Denied (403) | Denied (403) | Full Access | Denied (403) |
| `PUBLIC` (Visitor)| Denied (401) | Denied (401) | Denied (401) | Read Published Only | Denied (401) |

> [!IMPORTANT]
> **Counselor Data Isolation (IDOR Protection)**:
> When a user with the `COUNSELOR` role requests `/api/admin/enquiries/:id`, `/api/admin/students/:id`, or creates follow-ups/conversations, the server verifies `assignedCounselorId === req.user.id`. Any attempt to access another counselor's case immediately returns `403 FORBIDDEN`.

---

## 3. Public REST Endpoints

### 3.1 Authentication
- `POST /api/auth/login`: Authenticate staff with email & password. Issues cookie and JWT.
- `POST /api/auth/logout`: Clears session cookie and invalidates client state.
- `GET /api/auth/me`: Returns safe authenticated user profile (`id`, `name`, `email`, `role`, `status`).

### 3.2 Single Student Enquiry
- `POST /api/enquiries`: Creates a student and admission enquiry.
  - **Body**: `firstName`, `phone`, `email`, `address`, `district`, `areaOfInterest`, `courseProgram`, `mark12th`, `consent`, `source`, `aadhaarNumber` (optional).
  - **Returns**: `enquiryId`, `enquiryCode` (`SG-YYYY-XXXXX`).

### 3.3 Programs & Categories
- `GET /api/programs`: Lists all published academic programs. Accepts `?category=<slug>&search=<query>`.
- `GET /api/programs/:slug`: Fetches program details by slug (Unpublished programs return `404`).
- `GET /api/categories`: Lists published academic categories with program counts.

### 3.4 News & Articles
- `GET /api/news`: Lists published articles with pagination. Accepts `?category=<name>&page=1&limit=10`.
- `GET /api/news/:slug`: Fetches published article details (Unpublished articles return `404`).

### 3.5 General Contact
- `POST /api/contact`: Submits public message (`name`, `email`, `phone`, `subject`, `message`). Guarded by rate limiting.

### 3.6 Donations (Feature-Flagged)
- `POST /api/donations`: Returns `403 DONATION_MODULE_DISABLED` unless `ENABLE_DONATION_MODULE=true`.
- `POST /api/payments/webhook`: Returns `403 PAYMENT_GATEWAY_DISABLED` unless `ENABLE_PAYMENT_GATEWAY=true`.

---

## 4. Protected Administrative / CRM Endpoints (`/api/admin`)

### 4.1 Admission Enquiries
- `GET /api/admin/enquiries`: List enquiries with search and filters (`status`, `district`, `source`, `counselorId`). Counselors receive only their caseload.
- `GET /api/admin/enquiries/:id`: Retrieve enquiry details with joined student, program, counselor, and follow-ups.
- `PATCH /api/admin/enquiries/:id`: Update enquiry status, counselor assignment (Admins only), or internal notes.
- `POST /api/admin/enquiries/:id/followups`: Schedule a follow-up action for the enquiry.

### 4.2 Students & Timelines
- `GET /api/admin/students`: List registered students with masked Aadhaar (`aadhaarMasked`).
- `GET /api/admin/students/:id`: Retrieve student details.
- `GET /api/admin/students/:id/conversations`: Non-realtime timeline interaction entries.
- `POST /api/admin/students/:id/conversations`: Add a counselor interaction note (`channel`, `message`).

### 4.3 Counselors & Staff
- `GET /api/admin/counselors`: List active counselors and their workload counts. (Admins only).

### 4.4 Dashboard Analytics & Reports
- `GET /api/admin/reports/dashboard`: Returns real-time metrics aggregated directly from PostgreSQL:
  - Total, new, counseling, follow-ups due, converted, closed counts
  - Distribution by district
  - Counselor workload

### 4.5 Notifications
- `GET /api/admin/notifications`: Returns current staff user's notifications.
- `PATCH /api/admin/notifications/:id/read`: Mark notification as read.

### 4.6 Academic Programs CMS (`SUPER_ADMIN`, `ADMIN`, `CONTENT_MANAGER`)
- `GET /api/admin/programs`: List all programs (including drafts) with pagination, category, and status filters.
- `GET /api/admin/programs/:id`: Retrieve single program by ID for staff preview and editing.
- `POST /api/admin/programs`: Create a new program (validates unique slug, category relation, and logs audit event).
- `PATCH /api/admin/programs/:id`: Update program details or toggle publication state (`isPublished`).
- `DELETE /api/admin/programs/:id`: Delete program (blocks deletion if linked to active enquiries/students).

### 4.7 Program Categories CMS (`SUPER_ADMIN`, `ADMIN`, `CONTENT_MANAGER`)
- `GET /api/admin/programs/categories`: List all program categories with status and program counts.
- `POST /api/admin/programs/categories`: Create a new program category.
- `PATCH /api/admin/programs/categories/:id`: Update category name, description, or status.

### 4.8 News & Announcements CMS (`SUPER_ADMIN`, `ADMIN`, `CONTENT_MANAGER`)
- `GET /api/admin/news`: List all articles (including drafts) with category, search, and publication status filters.
- `GET /api/admin/news/:id`: Retrieve single news article by ID for staff preview and editing.
- `POST /api/admin/news`: Create a new news article (attributes author, deduplicates slug, logs audit event).
- `PATCH /api/admin/news/:id`: Update article fields or toggle publication state (`isPublished`).
- `DELETE /api/admin/news/:id`: Delete news article with audit log.

---

## 5. Standard Error Format

All error responses return a standardized JSON structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body parameters.",
    "fields": {
      "phone": "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.",
      "consent": "You must provide consent for Shasthi Guru counselors to contact you."
    }
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Missing or expired authentication token.
- `FORBIDDEN` (403): User lacks role privileges or failed counselor isolation boundary.
- `NOT_FOUND` (404): Resource or slug does not exist.
- `VALIDATION_ERROR` (400): Request schema failed Zod validation.
- `RATE_LIMIT_EXCEEDED` (429): Too many submissions received from IP address.
- `DONATION_MODULE_DISABLED` (403): Feature flag disabled.
