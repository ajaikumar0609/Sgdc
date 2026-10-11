// ============================================================================
// Shasthi Guru Dream Campus - Core TypeScript Type Definitions
// ============================================================================

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COUNSELOR' | 'CONTENT_MANAGER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type EnquiryStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'CONTACTED'
  | 'COUNSELING'
  | 'FOLLOW_UP'
  | 'ADMISSION_SUPPORT'
  | 'CONVERTED'
  | 'CLOSED';

export type EnquirySource =
  | 'HOME_HERO'
  | 'ADMISSION_PAGE'
  | 'ADMISSION_QUERY'
  | 'PROGRAM_PAGE'
  | 'COUNSELING_PAGE'
  | 'ENQUIRY_PAGE'
  | 'CONTACT_PAGE'
  | 'DIRECT';

export type FollowUpStatus = 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';

export type InteractionChannel = 'PHONE' | 'WHATSAPP' | 'IN_PERSON' | 'EMAIL';

export type DonationStatus = 'INITIATED' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface StudentRecord {
  id: string;
  firstName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  areaOfInterest: string;
  courseProgram: string;
  mark12th: string;
  aadhaarMasked?: string | null;
  consentGiven: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdmissionEnquiryRecord {
  id: string;
  enquiryCode: string; // e.g. SG-2026-00101
  studentId: string;
  student?: StudentRecord;
  programId?: string | null;
  source: EnquirySource;
  status: EnquiryStatus;
  assignedCounselorId?: string | null;
  assignedCounselor?: {
    id: string;
    name: string;
    email: string;
  } | null;
  internalNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FollowUpRecord {
  id: string;
  enquiryId: string;
  counselorId: string;
  counselorName?: string;
  scheduledAt: Date;
  completedAt?: Date | null;
  status: FollowUpStatus;
  feedbackNote?: string | null;
  nextActionDate?: Date | null;
  createdAt: Date;
}

export interface ConversationEntry {
  id: string;
  enquiryId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  channel: InteractionChannel;
  content: string;
  timestamp: Date;
}

export interface ProgramCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  displayOrder: number;
  programsCount?: number;
}

export interface ProgramRecord {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  degreeLevel: string; // Undergraduate, Postgraduate, Diploma
  durationYears: string;
  overview: string;
  eligibilityCriteria?: string | null;
  careerOpportunities?: string | null;
  imageUrl?: string | null;
  isPublished: boolean;
}

export interface NewsArticleRecord {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  isPublished: boolean;
  publishedAt: Date;
  authorName?: string;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'RESPONDED';
  createdAt: Date;
}

export interface DashboardStatistics {
  totalEnquiries: number;
  newEnquiries: number;
  followupsDue: number;
  counselingCases: number;
  convertedEnquiries: number;
  closedEnquiries: number;
  enquiriesByDistrict: { district: string; count: number }[];
  enquiriesByProgram: { program: string; count: number }[];
  counselorWorkload: { counselorName: string; count: number }[];
}

export const TAMIL_NADU_DISTRICTS = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kanchipuram',
  'Kanyakumari',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Namakkal',
  'Nilgiris',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupathur',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Viluppuram',
  'Virudhunagar',
  'Other State / Union Territory'
] as const;

export const ACADEMIC_INTEREST_AREAS = [
  'Engineering & Technology',
  'Medical & Healthcare',
  'Arts & Science',
  'Nursing',
  'Pharmacy',
  'Paramedical Sciences',
  'Management & Business Studies',
  'IT & Computer Applications',
  'Design & Architecture',
  'Law & Integrated Studies',
  'Other Specialized Programs'
] as const;
