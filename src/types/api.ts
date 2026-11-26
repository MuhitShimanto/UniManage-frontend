export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export type EnrollmentStatus = "ENROLLED" | "DROPPED" | "COMPLETED";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export type PaymentProvider = "SSLCOMMERZ";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: string;
  code: string;
  name: string;
  totalCreditsRequired: number;
  departmentId: string;
  department?: Department;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentCode: string;
  programId: string;
  admissionYear: number;
  currentCgpa: number;
  program?: Program;
}

export interface InstructorProfile {
  id: string;
  userId: string;
  employeeCode: string;
  departmentId: string;
  designation: string;
  department?: Department;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  studentProfile?: StudentProfile | null;
  instructorProfile?: InstructorProfile | null;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string | null;
    studentCode?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface CoursePrerequisiteItem {
  id: string;
  courseId: string;
  prerequisiteId: string;
  prerequisite: {
    id: string;
    code: string;
    title: string;
    credits?: number;
  };
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  credits: number;
  syllabusUrl?: string | null;
  departmentId: string;
  programId?: string | null;
  department?: Department;
  program?: Program | null;
  prerequisites?: CoursePrerequisiteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  id: string;
  name: string;
  year: number;
  term: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  registrationOpen: boolean;
  createdAt: string;
}

export interface Section {
  id: string;
  courseId: string;
  semesterId: string;
  instructorId: string;
  sectionCode: string;
  maxCapacity: number;
  enrolledCount: number;
  scheduleSlot: string;
  room?: string | null;
  course: {
    id: string;
    code: string;
    title: string;
    credits: number;
    syllabusUrl?: string | null;
  };
  semester: {
    id: string;
    name: string;
    isCurrent: boolean;
    registrationOpen: boolean;
  };
  instructor: {
    id: string;
    employeeCode: string;
    designation: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  enrollments?: SectionEnrollmentItem[];
}

export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string | null;
}

export interface ExamResult {
  id: string;
  enrollmentId: string;
  attendanceScore: number;
  assignmentScore: number;
  midtermScore: number;
  finalScore: number;
  totalScore: number;
  grade: string;
  gradePoint: number;
  isPublished: boolean;
  publishedAt?: string | null;
}

export interface Enrollment {
  id: string;
  studentId: string;
  sectionId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  droppedAt?: string | null;
  section: Section;
  examResult?: ExamResult | null;
}

export interface SectionEnrollmentItem {
  id: string;
  studentId: string;
  sectionId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  student: {
    id: string;
    studentCode: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string | null;
    };
  };
  examResult?: ExamResult | null;
  attendances?: AttendanceRecord[];
}

export interface StudentSectionAttendance {
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  records: AttendanceRecord[];
}

export interface TranscriptCourseItem {
  courseCode: string;
  courseTitle: string;
  credits: number;
  semester: string;
  totalScore: number;
  grade: string;
  gradePoint: number;
  publishedAt?: string | null;
}

export interface Transcript {
  studentCode: string;
  studentName: string;
  program?: string;
  cgpa: number;
  totalCreditsEarned: number;
  courses: TranscriptCourseItem[];
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  semesterId: string;
  title: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string | null;
  semester?: Semester;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  studentId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  transactionId: string;
  gatewayPaymentId?: string | null;
  status: PaymentStatus;
  paidAt?: string | null;
  createdAt: string;
  invoice?: FeeInvoice;
}

export interface PaymentInitiateResponse {
  paymentId: string;
  transactionId: string;
  provider: PaymentProvider;
  amount: number;
  gatewayUrl: string;
}

export interface AdminDashboardStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
  totalPaidTransactions: number;
  totalRevenueBdt: number;
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
  actor?: {
    id: string;
    email: string;
    role: Role;
  } | null;
}
