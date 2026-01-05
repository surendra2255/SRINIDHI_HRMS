
import React from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  FileText,
  ClipboardList,
  Clock,
  UserCircle,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { UserRole, Employee } from './types';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['HR', 'Employee'] },
  { id: 'tasks', label: 'My Tasks', icon: <ClipboardList size={20} />, roles: ['Employee'] },
  { id: 'profiles', label: 'Profiles', icon: <UserCircle size={20} />, roles: ['HR'] },
  { id: 'documents', label: 'Documents', icon: <FileText size={20} />, roles: ['HR', 'Employee'] },
  { id: 'recruitment', label: 'Recruitment', icon: <Briefcase size={20} />, roles: ['HR'] },
  { id: 'performance', label: 'Performance', icon: <TrendingUp size={20} />, roles: ['HR', 'Employee'] },
  { id: 'attendance', label: 'Attendance Mgmt', icon: <Clock size={20} />, roles: ['HR', 'Employee'] },
  { id: 'security', label: 'Security', icon: <Lock size={20} />, roles: ['HR', 'Employee'] },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { 
    id: 'emp-alice', 
    employeeId: 'SA-001',
    name: 'Alice Johnson', 
    role: 'Senior Developer', 
    department: 'Engineering', 
    email: 'alice.j@srinidhi.com', 
    password: 'password123',
    status: 'Active', 
    avatar: 'https://picsum.photos/seed/alice/100/100', 
    joinDate: '2022-03-15',
    tasks: [
      { id: 't1', title: 'Complete code review for v2.0', dueDate: '2024-05-20', status: 'Completed', priority: 'High' },
      { id: 't2', title: 'Onboard new junior dev', dueDate: '2024-06-01', status: 'In Progress', priority: 'Medium' }
    ],
    documents: [
      { 
        id: 'doc-101', 
        name: 'Offer Letter', 
        type: 'Contract', 
        uploadDate: '2022-03-10', 
        status: 'Verified',
        statusHistory: [
          { status: 'Pending', timestamp: 'Mar 09, 2022, 10:00 AM' },
          { status: 'Verified', timestamp: 'Mar 10, 2022, 11:30 AM' }
        ]
      }
    ]
  },
  { 
    id: 'emp-bob', 
    employeeId: 'SA-002',
    name: 'Bob Smith', 
    role: 'Product Manager', 
    department: 'Product', 
    email: 'bob.s@srinidhi.com', 
    password: 'password123',
    status: 'Active', 
    avatar: 'https://picsum.photos/seed/bob/100/100', 
    joinDate: '2021-11-01',
    tasks: [
      { id: 't3', title: 'Finalize Q3 roadmap', dueDate: '2024-05-25', status: 'Pending', priority: 'High' }
    ],
    documents: []
  },
  { 
    id: 'emp-charlie', 
    employeeId: 'SA-003',
    name: 'Charlie Davis', 
    role: 'UI Designer', 
    department: 'Design', 
    email: 'charlie.d@srinidhi.com', 
    password: 'password123',
    status: 'On Leave', 
    avatar: 'https://picsum.photos/seed/charlie/100/100', 
    joinDate: '2023-01-20',
    tasks: [],
    documents: []
  },
  { 
    id: 'emp-diana', 
    employeeId: 'SA-004',
    name: 'Diana Prince', 
    role: 'HR Specialist', 
    department: 'Human Resources', 
    email: 'diana.p@srinidhi.com', 
    password: 'password123',
    status: 'Active', 
    avatar: 'https://picsum.photos/seed/diana/100/100', 
    joinDate: '2020-05-12',
    tasks: [
      { id: 't4', title: 'Review open recruitment JDs', dueDate: '2024-05-18', status: 'Completed', priority: 'Medium' }
    ],
    documents: []
  },
];

export const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Human Resources', 'Finance'];
