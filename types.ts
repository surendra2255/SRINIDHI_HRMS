
export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  avatar: string;
  joinDate: string;
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
