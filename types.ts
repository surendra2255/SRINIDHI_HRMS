
export type UserRole = 'HR' | 'Employee';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
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

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  email: string;
  password?: string;
  mustChangePassword?: boolean;
  status: 'Active' | 'On Leave' | 'Inactive' | 'Frozen';
  avatar: string;
  joinDate: string;
  tasks?: Task[];
  documents?: Document[];
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
  reviewer: string;
  date: string;
  rating: number;
  comments: string;
  summary?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
