
import React from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  FileText,
  ClipboardList
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
  { id: 'employees', label: 'Employees', icon: <Users size={20} />, roles: ['HR'] },
  { id: 'documents', label: 'My Documents', icon: <FileText size={20} />, roles: ['Employee'] },
  { id: 'recruitment', label: 'Recruitment', icon: <Briefcase size={20} />, roles: ['HR'] },
  { id: 'performance', label: 'Performance', icon: <TrendingUp size={20} />, roles: ['HR', 'Employee'] },
  { id: 'leave', label: 'Leave Mgmt', icon: <Calendar size={20} />, roles: ['HR', 'Employee'] },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { 
    id: 'emp-alice', 
    name: 'Alice Johnson', 
    role: 'Senior Developer', 
    department: 'Engineering', 
    email: 'alice.j@srinidhi.com', 
    status: 'Active', 
    avatar: 'https://picsum.photos/seed/alice/100/100', 
    joinDate: '2022-03-15',
    tasks: [
      { id: 't1', title: 'Complete code review for v2.0', dueDate: '2024-05-20', status: 'Completed', priority: 'High' },
      { id: 't2', title: 'Onboard new junior dev', dueDate: '2024-06-01', status: 'In Progress', priority: 'Medium' }
    ]
  },
  { 
    id: 'emp-bob', 
    name: 'Bob Smith', 
    role: 'Product Manager', 
    department: 'Product', 
    email: 'bob.s@srinidhi.com', 
    status: 'Active', 
    avatar: 'https://picsum.photos/seed/bob/100/100', 
    joinDate: '2021-11-01',
    tasks: [
      { id: 't3', title: 'Finalize Q3 roadmap', dueDate: '2024-05-25', status: 'Pending', priority: 'High' }
    ]
  },
  { 
    id: 'emp-charlie', 
    name: 'Charlie Davis', 
    role: 'UI Designer', 
    department: 'Design', 
    email: 'charlie.d@srinidhi.com', 
    status: 'On Leave', 
    avatar: 'https://picsum.photos/seed/charlie/100/100', 
    joinDate: '2023-01-20',
    tasks: []
  },
  { 
    id: 'emp-diana', 
    name: 'Diana Prince', 
    role: 'HR Specialist', 
    department: 'Human Resources', 
    email: 'diana.p@srinidhi.com', 
    status: 'Active', 
    avatar: 'https://picsum.photos/seed/diana/100/100', 
    joinDate: '2020-05-12',
    tasks: [
      { id: 't4', title: 'Review open recruitment JDs', dueDate: '2024-05-18', status: 'Completed', priority: 'Medium' }
    ]
  },
];

export const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Human Resources', 'Finance'];
