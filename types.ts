
export type UserRole = 'HR' | 'Employee' | 'RecoveryAgent' | 'FieldOfficer' | 'ITAdmin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  permissions?: string[];
}

export interface RecoveryCase {
  id: string;
  bankName: string;
  accountNumber: string;
  customerName: string;
  amountDue: number;
  status: 'New' | 'In Progress' | 'Legal' | 'Settled' | 'Closed';
  assignedAgentId: string;
  lastUpdate: string;
  notes: string[];
  priority: 'Low' | 'Medium' | 'High';
  timeline?: CaseTimelineEvent[];
  followUps?: FollowUpReminder[];
}

export interface CaseTimelineEvent {
  id: string;
  caseId: string;
  type: 'Call' | 'Visit' | 'Status Change' | 'Note' | 'Legal Action';
  details: string;
  agentId: string;
  agentName: string;
  timestamp: string;
}

export interface FollowUpReminder {
  id: string;
  caseId: string;
  customerName: string;
  agentId: string;
  dueDate: string;
  type: 'Call' | 'Visit';
  status: 'Pending' | 'Completed' | 'Overdue';
  notes?: string;
}

export interface ITSupportTicket {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: 'Hardware' | 'Software' | 'Network' | 'Access' | 'Other';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: string;
  updatedAt: string;
  comments: {
    userId: string;
    userName: string;
    text: string;
    timestamp: string;
  }[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface FieldVisit {
  id: string;
  caseId: string;
  officerId: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: string;
  photoUrl?: string;
  notes: string;
  offline?: boolean;
}

export interface CRMLead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Lead' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Contracted' | 'Lost';
  source: string;
  assignedTo: string;
  value?: number;
  lastContactDate: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export type LeaveStatus = 'Pending' | 'Pending Supervisor' | 'Pending HOD' | 'Approved' | 'Rejected' | 'Policy Violation (HR)';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  type: 'Annual' | 'Sick' | 'Personal' | 'Maternity/Paternity';
  status: LeaveStatus;
  appliedDate: string;
  supervisorApproved?: boolean;
  hodApproved?: boolean;
}

export interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  available: number;
}

export type ResignationStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn';

export interface ResignationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  reason: string;
  appliedDate: string;
  lastWorkingDate: string;
  status: ResignationStatus;
  feedback?: string;
  clearanceCompleted?: boolean;
}

export interface InventoryItem {
  id: string;
  assetId: string;
  name: string;
  category: string;
  serialNumber: string;
  assignedTo?: string; // Employee Name or ID
  status: 'In Stock' | 'Assigned' | 'Maintenance' | 'Retired';
  purchaseDate: string;
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  role: string; // This is the Job Title
  accessRole: UserRole; // This is the Security Level (Administrator/Normal User)
  department: string;
  email: string;
  password?: string;
  mustChangePassword?: boolean;
  failedLoginAttempts?: number;
  lockoutUntil?: string | null;
  hasLoggedInBefore?: boolean;
  status: 'Active' | 'On Leave' | 'Inactive' | 'Frozen';
  avatar: string;
  joinDate: string;
  permissions?: string[];
  tasks?: Task[];
  documents?: Document[];
  leaveRequests?: LeaveRequest[];
  resignation?: ResignationRequest;
}

export interface DocumentHistoryEntry {
  status: 'Verified' | 'Pending';
  timestamp: string;
  verifiedBy?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: 'Verified' | 'Pending';
  statusHistory?: DocumentHistoryEntry[];
  verifiedBy?: string;
  metadata?: any; // For storing payslip details or other specific data
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  status: 'Open' | 'Closed' | 'Draft';
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  period: string; // e.g., "Q1 2026"
  date: string;
  kpis: KPI[];
  overallRating: number;
  comments: string;
  status: 'Draft' | 'Submitted' | 'Acknowledged';
}

export interface KPI {
  id: string;
  name: string;
  target: string;
  achieved: string;
  score: number; // 1-5
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'Compliance' | 'Technical' | 'Soft Skills' | 'Onboarding';
  videoUrl?: string;
  duration: string;
  quiz: QuizQuestion[];
  completedBy: string[]; // Array of employee IDs
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of options
}

export interface InternalMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: string;
  expiresAt?: string;
  priority: 'Normal' | 'High' | 'Urgent';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CompanyEvent {
  id: string;
  title: string;
  date: string;
  type: 'Meeting' | 'Holiday' | 'Deadline' | 'Event' | 'Schedule';
  description?: string;
  location?: string;
  participants?: string[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'Travel' | 'Equipment' | 'Office' | 'Legal' | 'Marketing' | 'Other';
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedBy: string;
  receiptUrl?: string;
}
