
import React from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  Settings,
  Search,
  Plus,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'employees', label: 'Employees', icon: <Users size={20} /> },
  { id: 'recruitment', label: 'Recruitment', icon: <Briefcase size={20} /> },
  { id: 'performance', label: 'Performance', icon: <TrendingUp size={20} /> },
  { id: 'leave', label: 'Leave Mgmt', icon: <Calendar size={20} /> },
];

export const MOCK_EMPLOYEES = [
  { id: '1', name: 'Alice Johnson', role: 'Senior Developer', department: 'Engineering', email: 'alice.j@srinidhi.com', status: 'Active', avatar: 'https://picsum.photos/seed/alice/100/100', joinDate: '2022-03-15' },
  { id: '2', name: 'Bob Smith', role: 'Product Manager', department: 'Product', email: 'bob.s@srinidhi.com', status: 'Active', avatar: 'https://picsum.photos/seed/bob/100/100', joinDate: '2021-11-01' },
  { id: '3', name: 'Charlie Davis', role: 'UI Designer', department: 'Design', email: 'charlie.d@srinidhi.com', status: 'On Leave', avatar: 'https://picsum.photos/seed/charlie/100/100', joinDate: '2023-01-20' },
  { id: '4', name: 'Diana Prince', role: 'HR Specialist', department: 'Human Resources', email: 'diana.p@srinidhi.com', status: 'Active', avatar: 'https://picsum.photos/seed/diana/100/100', joinDate: '2020-05-12' },
];

export const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Human Resources', 'Finance'];
