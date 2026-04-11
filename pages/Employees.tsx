
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, MoreVertical, Plus, Trash2, X, ClipboardList, CheckCircle, 
  UserPlus, Snowflake, Power, UserCheck,
  LayoutList, LayoutGrid, Rows3, ChevronDown, Fingerprint, Hash, UserCircle,
  Lock, ShieldAlert, AlertTriangle, 
  User as UserIcon, FileDown, Square, CheckSquare, 
  UserMinus, UserX,
  TriangleAlert,
  Activity,
  Clock,
  Eye,
  EyeOff,
  Unlock,
  MailCheck,
  Filter,
  Briefcase,
  ShieldCheck,
  UserCog,
  Shield,
  Crown,
  Medal,
  Award
} from 'lucide-react';
import { DEPARTMENTS, HIERARCHY_ADMIN_DESIGNATIONS } from '../constants';
import { Employee, Task, UserRole } from '../types';
import { exportToCSV } from '../lib/exportUtils';
import { sendEmailNotification } from '../lib/emailUtils';
import TwoFactorModal from '../components/TwoFactorModal';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface EmployeesProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  addNotification: (userId: string, title: string, message: string) => void;
  logAction: (module: string, action: string, details: string) => void;
}

type ViewMode = 'list' | 'grid' | 'compact';
type TaskFilterType = 'All' | 'No Tasks' | 'Has Tasks';

const Employees: React.FC<EmployeesProps> = ({ employees, setEmployees, addNotification, logAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [taskFilter, setTaskFilter] = useState<TaskFilterType>('All');
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showNewEmpPassword, setShowNewEmpPassword] = useState(false);
  
  // Deletion/Freeze States
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [employeeToFreeze, setEmployeeToFreeze] = useState<Employee | null>(null);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [newTaskStatus, setNewTaskStatus] = useState<Task['status']>('Pending');
  
  const [formError, setFormError] = useState<string | null>(null);
  const [adminResetPass, setAdminResetPass] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Task search state for the slide-over
  const [taskSearchTerm, setTaskSearchTerm] = useState('');

  // Mock presence data
  const [activeViewers, setActiveViewers] = useState<{id: string, name: string, avatar: string}[]>([]);

  useEffect(() => {
    if (viewingEmployee) {
      // Simulate other HR managers joining/leaving
      const mockViewers = [
        { id: 'v1', name: 'Priya Sharma', avatar: 'https://picsum.photos/seed/priya/100/100' },
        { id: 'v2', name: 'Rahul Verma', avatar: 'https://picsum.photos/seed/rahul/100/100' }
      ];
      setActiveViewers(mockViewers.slice(0, Math.floor(Math.random() * 3)));
    } else {
      setActiveViewers([]);
    }
  }, [viewingEmployee]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const [newEmp, setNewEmp] = useState({
    employeeId: '',
    name: '',
    role: '',
    accessRole: 'Employee' as UserRole,
    department: DEPARTMENTS[0],
    email: '',
    password: 'Password123!',
    status: 'Active' as const
  });

  // Automatically switch to 'HR' accessRole if a Hierarchy role is selected
  useEffect(() => {
    if (HIERARCHY_ADMIN_DESIGNATIONS.includes(newEmp.role)) {
      setNewEmp(prev => ({ ...prev, accessRole: 'HR' }));
    }
  }, [newEmp.role]);

  // Real-time validation states
  const idRegex = /^SA-[A-Z]*\d+$/; // Updated to allow MD codes etc
  const isIdFormatValid = idRegex.test(newEmp.employeeId) || newEmp.employeeId.length > 3;
  const isIdUnique = !employees.some(emp => emp.employeeId.toUpperCase() === newEmp.employeeId.toUpperCase());
  const canSubmit = isIdFormatValid && isIdUnique && newEmp.name && newEmp.email && newEmp.role && newEmp.password;

  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    
    const matchesSearch = 
      emp.name.toLowerCase().includes(term) ||
      emp.role.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term);
    
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    
    const hasTasks = emp.tasks && emp.tasks.length > 0;
    const matchesTasks = 
      taskFilter === 'All' ? true :
      taskFilter === 'No Tasks' ? !hasTasks :
      taskFilter === 'Has Tasks' ? hasTasks : true;

    return matchesSearch && matchesStatus && matchesDept && matchesTasks;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmployees.map(e => e.id));
    }
  };

  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const updateEmployeeStatus = (id: string, newStatus: Employee['status']) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        const statusMap = {
          'Active': { title: 'Account Activated', msg: 'Your professional access has been restored by HR.' },
          'Inactive': { title: 'Account Deactivated', msg: 'Your account has been moved to inactive status.' },
          'Frozen': { title: 'Account Frozen', msg: 'Your account has been temporarily frozen for security purposes.' },
          'On Leave': { title: 'Leave Approved', msg: 'Your status has been updated to On Leave.' }
        };
        const notify = statusMap[newStatus];
        addNotification(id, notify.title, notify.msg);
        return { ...emp, status: newStatus };
      }
      return emp;
    }));
    setMenuOpenId(null);
  };

  const unlockEmployee = (id: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        addNotification(id, "Security: Account Unlocked", "An HR Administrator has reset your failed login attempts and restored access.");
        return { ...emp, failedLoginAttempts: 0, lockoutUntil: null };
      }
      return emp;
    }));
    if (viewingEmployee?.id === id) {
      setViewingEmployee(prev => prev ? { ...prev, failedLoginAttempts: 0, lockoutUntil: null } : null);
    }
    setMenuOpenId(null);
  };

  const handleBulkDelete = () => {
    setEmployees(prev => prev.filter(emp => !selectedIds.includes(emp.id)));
    setSelectedIds([]);
  };

  const handleDeleteEmployee = () => {
    if (!employeeToDelete || !isDeleteConfirmed) return;
    setPendingDeleteId(employeeToDelete.id);
    setIs2FAModalOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    const emp = employees.find(e => e.id === pendingDeleteId);
    setEmployees(prev => prev.filter(e => e.id !== pendingDeleteId));
    if (emp) {
      logAction('Employees', 'Delete Employee', `Deleted employee: ${emp.name} (${emp.employeeId})`);
    }
    setEmployeeToDelete(null);
    setIsDeleteConfirmed(false);
    setPendingDeleteId(null);
    setMenuOpenId(null);
  };

  const handleFreezeEmployee = () => {
    if (!employeeToFreeze || !isDeleteConfirmed) return;
    updateEmployeeStatus(employeeToFreeze.id, 'Frozen');
    logAction('Employees', 'Freeze Employee', `Froze employee account: ${employeeToFreeze.name} (${employeeToFreeze.employeeId})`);
    setEmployeeToFreeze(null);
    setIsDeleteConfirmed(false);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredEmployees, 'employee_directory', {
      employeeId: 'Employee ID',
      name: 'Name',
      role: 'Designation',
      department: 'Department',
      email: 'Email',
      status: 'Status',
      accessRole: 'Access Role',
      joinDate: 'Joining Date'
    });
    logAction('Employees', 'Export Data', `Exported ${filteredEmployees.length} employees to CSV`);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!isIdUnique) {
      setFormError(`Registry Conflict: The identifier '${newEmp.employeeId}' is already assigned.`);
      return;
    }

    const employee: Employee = {
      id: `emp-${Date.now()}`,
      ...newEmp,
      avatar: `https://picsum.photos/seed/${newEmp.name.replace(/\s+/g, '')}/100/100`,
      joinDate: new Date().toISOString().split('T')[0],
      tasks: [],
      documents: [],
      failedLoginAttempts: 0,
      lockoutUntil: null,
      hasLoggedInBefore: false
    };
    
    setEmployees(prev => [employee, ...prev]);
    setIsAddingEmployee(false);
    
    setNewEmp({ employeeId: '', name: '', role: '', accessRole: 'Employee', department: DEPARTMENTS[0], email: '', password: 'Password123!', status: 'Active' });
    setShowNewEmpPassword(false);

    addNotification(employee.id, 'Welcome to Srinidhi Associates!', 'Your account has been created. Please log in with your credentials.');
    logAction('Employees', 'Create Employee', `Created new employee: ${employee.name} (${employee.employeeId})`);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1e3a8a', '#ef4444', '#f59e0b']
    });

    // Send onboarding email
    sendEmailNotification(
      employee.email,
      'Welcome to Srinidhi Associates - Your Account is Ready',
      `Dear ${employee.name},\n\nWelcome to the team! Your employee profile has been created.\n\nEmployee ID: ${employee.employeeId}\nRole: ${employee.role}\n\nPlease log in to the HRMS portal to complete your onboarding.`
    );
  };

  const handleAdminResetPassword = () => {
    if (!viewingEmployee || !adminResetPass.trim()) return;
    setEmployees(prev => prev.map(emp => 
      emp.id === viewingEmployee.id ? { ...emp, password: adminResetPass, failedLoginAttempts: 0, lockoutUntil: null } : emp
    ));
    addNotification(viewingEmployee.id, "Security: Credentials Reset", "An HR Administrator has updated your organizational access token.");
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
    setAdminResetPass('');
  };

  const addTask = () => {
    if (!viewingEmployee || !newTaskTitle.trim()) return;
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title: newTaskTitle,
      dueDate: newTaskDueDate,
      status: newTaskStatus,
      priority: newTaskPriority
    };
    setEmployees(prev => prev.map(emp => 
      emp.id === viewingEmployee.id ? { ...emp, tasks: [...(emp.tasks || []), newTask] } : emp
    ));
    setViewingEmployee(prev => prev ? { ...prev, tasks: [...(prev.tasks || []), newTask] } : null);
    addNotification(viewingEmployee.id, "New Assignment", `HR has assigned you a new task: ${newTaskTitle}`);
    setNewTaskTitle('');
  };

  const filteredMemberTasks = useMemo(() => {
    if (!viewingEmployee) return [];
    const tasks = viewingEmployee.tasks || [];
    if (!taskSearchTerm.trim()) return tasks;
    return tasks.filter(t => 
      t.title.toLowerCase().includes(taskSearchTerm.toLowerCase())
    );
  }, [viewingEmployee, taskSearchTerm]);

  const StatusBadge = ({ emp }: { emp: Employee }) => {
    const isLocked = emp.lockoutUntil && new Date(emp.lockoutUntil).getTime() > Date.now();
    return (
      <div className="flex flex-col gap-1 items-start">
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
          emp.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
          emp.status === 'On Leave' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
          emp.status === 'Frozen' ? 'bg-blue-50 text-blue-700 border-blue-100' :
          'bg-gray-100 text-gray-500 border-gray-200'
        }`}>
          {emp.status}
        </span>
        {isLocked && (
          <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
            <Lock size={8} /> Locked Out
          </span>
        )}
      </div>
    );
  };

  const AccessBadge = ({ emp }: { emp: Employee }) => {
    const isHierarchyRole = HIERARCHY_ADMIN_DESIGNATIONS.includes(emp.role);
    if (isHierarchyRole) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center w-fit gap-1.5 bg-amber-50 text-amber-700 border-amber-200 shadow-sm animate-pulse">
          <Crown size={10} /> Executive Authority
        </span>
      );
    }
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center w-fit gap-1.5 ${
        emp.accessRole === 'HR' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
      }`}>
        {emp.accessRole === 'HR' ? <ShieldCheck size={10} /> : <UserCog size={10} />}
        {emp.accessRole === 'HR' ? 'Administrator' : 'Normal User'}
      </span>
    );
  };

  const ActionMenu = ({ emp }: { emp: Employee }) => {
    const isLocked = emp.lockoutUntil && new Date(emp.lockoutUntil).getTime() > Date.now();
    return (
      <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === emp.id ? null : emp.id); }}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-blue-900 transition-all"
        >
          <MoreVertical size={18} />
        </button>

        {menuOpenId === emp.id && (
          <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 space-y-1">
              <button 
                onClick={() => { setViewingEmployee(emp); setTaskSearchTerm(''); }} 
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-3"
              >
                <ClipboardList size={14}/> View Profile
              </button>
              
              <div className="h-[1px] bg-gray-50 my-1" />
              
              <p className="px-3 py-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status Governance</p>
              
              {isLocked && (
                <button 
                  onClick={() => unlockEmployee(emp.id)} 
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-orange-600 hover:bg-orange-50 flex items-center gap-3"
                >
                  <Unlock size={14}/> Emergency Unlock
                </button>
              )}

              {emp.status !== 'Active' && (
                <button 
                  onClick={() => updateEmployeeStatus(emp.id, 'Active')} 
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-green-600 hover:bg-green-50 flex items-center gap-3"
                >
                  <UserCheck size={14}/> Activate
                </button>
              )}
              
              {emp.status !== 'Inactive' && (
                <button 
                  onClick={() => updateEmployeeStatus(emp.id, 'Inactive')} 
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3"
                >
                  <UserX size={14}/> Deactivate
                </button>
              )}
              
              {emp.status !== 'Frozen' && (
                <button 
                  onClick={() => { setEmployeeToFreeze(emp); setIsDeleteConfirmed(false); }} 
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-3"
                >
                  <Snowflake size={14}/> Freeze Account
                </button>
              )}
              
              <div className="h-[1px] bg-gray-50 my-1" />
              
              <button 
                onClick={() => { setEmployeeToDelete(emp); setIsDeleteConfirmed(false); }} 
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3"
              >
                <Trash2 size={14}/> Delete Permanently
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderListView = () => (
    <div key="list" className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="px-6 py-5 w-10">
              <button onClick={toggleSelectAll} className={`w-5 h-5 rounded flex items-center justify-center transition-all ${selectedIds.length === filteredEmployees.length ? 'bg-blue-900 text-white' : 'bg-white border border-gray-300 text-transparent'}`}>
                {selectedIds.length === filteredEmployees.length ? <CheckSquare size={14} /> : <Square size={14} />}
              </button>
            </th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee ID</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Access Level</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          <AnimatePresence mode="popLayout">
            {filteredEmployees.map(emp => {
              const isSelected = selectedIds.includes(emp.id);
              return (
                <motion.tr 
                  key={emp.id} 
                  variants={item}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, x: -20 }}
                  layout
                  onClick={() => { setViewingEmployee(emp); setTaskSearchTerm(''); }} 
                  className={`hover:bg-blue-50/30 transition-all cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <button onClick={(e) => toggleSelect(emp.id, e)} className={`w-5 h-5 rounded flex items-center justify-center transition-all ${isSelected ? 'bg-blue-900 text-white shadow-sm' : 'bg-white border border-gray-200 text-transparent'}`}>
                      {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400">{emp.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                         <img src={emp.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover" />
                         {HIERARCHY_ADMIN_DESIGNATIONS.includes(emp.role) && (
                           <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm border border-white">
                              <Crown size={8} />
                           </div>
                         )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-900">{emp.name}</p>
                        <p className="text-[11px] text-gray-400 font-bold uppercase">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AccessBadge emp={emp} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-500 uppercase">{emp.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge emp={emp} /></td>
                  <td className="px-6 py-4 text-right"><ActionMenu emp={emp} /></td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div key="grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
      {filteredEmployees.map(emp => {
        const isSelected = selectedIds.includes(emp.id);
        const isHierarchy = HIERARCHY_ADMIN_DESIGNATIONS.includes(emp.role);
        return (
          <div 
            key={emp.id} 
            onClick={() => { setViewingEmployee(emp); setTaskSearchTerm(''); }}
            className={`bg-white p-6 rounded-[2.5rem] border transition-all cursor-pointer relative group ${isSelected ? 'border-blue-900 bg-blue-50/20 ring-4 ring-blue-900/5 shadow-md' : 'border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-lg'}`}
          >
            <div className="absolute top-4 left-4 z-10">
              <button 
                onClick={(e) => toggleSelect(emp.id, e)} 
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-blue-900 text-white shadow-sm' : 'bg-white/80 border border-gray-200 text-transparent hover:border-blue-400 backdrop-blur-sm opacity-0 group-hover:opacity-100'}`}
              >
                {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
              </button>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ActionMenu emp={emp} />
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                 <img src={emp.avatar} alt="" className={`w-20 h-20 rounded-[2rem] object-cover shadow-md border-4 ${isHierarchy ? 'border-amber-100 ring-2 ring-amber-500/20' : 'border-white'}`} />
                 {isHierarchy && (
                   <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                      <Crown size={14} />
                   </div>
                 )}
              </div>
              <h3 className="text-sm font-bold text-blue-900 mb-1">{emp.name}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{emp.role}</p>
              
              <div className="mb-4">
                <AccessBadge emp={emp} />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl">
                  <span className="text-[9px] font-black text-gray-400 uppercase">Dept</span>
                  <span className="text-[10px] font-bold text-blue-900">{emp.department}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl">
                  <span className="text-[9px] font-black text-gray-400 uppercase">ID</span>
                  <span className="text-[10px] font-bold text-blue-900">{emp.employeeId}</span>
                </div>
              </div>
              <div className="mt-4">
                <StatusBadge emp={emp} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCompactView = () => (
    <div key="compact" className="space-y-2 animate-in fade-in zoom-in-95 duration-500">
      {filteredEmployees.map(emp => {
        const isSelected = selectedIds.includes(emp.id);
        const isHierarchy = HIERARCHY_ADMIN_DESIGNATIONS.includes(emp.role);
        return (
          <div 
            key={emp.id} 
            onClick={() => { setViewingEmployee(emp); setTaskSearchTerm(''); }}
            className={`px-6 py-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-blue-50 border-blue-900 shadow-sm' : 'bg-white border-gray-100 shadow-sm hover:bg-blue-50/30'}`}
          >
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={(e) => toggleSelect(emp.id, e)} 
                className={`w-5 h-5 rounded flex items-center justify-center transition-all ${isSelected ? 'bg-blue-900 text-white shadow-sm' : 'bg-gray-50 border border-gray-200 text-transparent'}`}
              >
                {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
              </button>
              <span className="text-[10px] font-black text-gray-300 w-16">{emp.employeeId}</span>
              <div className="flex items-center gap-3">
                <img src={emp.avatar} alt="" className={`w-8 h-8 rounded-xl object-cover ${isHierarchy ? 'ring-1 ring-amber-500' : ''}`} />
                <p className="text-xs font-bold text-blue-900">{emp.name}</p>
                {isHierarchy && <Crown size={12} className="text-amber-500" />}
                <span className={`text-[8px] font-black uppercase border px-1.5 rounded ${emp.accessRole === 'HR' ? 'text-red-500 border-red-200' : 'text-blue-500 border-blue-200'}`}>
                  {emp.accessRole === 'HR' ? 'Admin' : 'User'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:block">{emp.department}</span>
              <StatusBadge emp={emp} />
              <ActionMenu emp={emp} />
            </div>
          </div>
        );
      })}
    </div>
  );

  const isViewedEmpLocked = viewingEmployee?.lockoutUntil && new Date(viewingEmployee.lockoutUntil).getTime() > Date.now();

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-tighter">Personnel Profiles</h1>
          <p className="text-gray-500 font-medium">Browse and manage comprehensive organization profiles.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsAddingEmployee(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-800 shadow-lg shadow-blue-900/10 transition-all active:scale-95"
          >
            <Plus size={18} /> Create Profile
          </button>
        </div>
      </header>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, role, department or email (case-insensitive)..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white transition-all font-medium text-sm text-blue-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors" size={16} />
              <select 
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="pl-12 pr-10 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white transition-all text-xs font-black uppercase tracking-widest appearance-none cursor-pointer text-blue-900"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            <div className="relative group">
              <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors" size={16} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-10 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white transition-all text-xs font-black uppercase tracking-widest appearance-none cursor-pointer text-blue-900"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
                <option value="Frozen">Frozen</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            <div className="relative group">
              <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors" size={16} />
              <select 
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value as TaskFilterType)}
                className="pl-12 pr-10 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white transition-all text-xs font-black uppercase tracking-widest appearance-none cursor-pointer text-blue-900"
              >
                <option value="All">All Assignments</option>
                <option value="No Tasks">No Tasks Assigned</option>
                <option value="Has Tasks">With Active Tasks</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <Filter size={14} />
            Showing {filteredEmployees.length} profiles
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 text-blue-900 transition-all shadow-sm active:scale-95"
            >
              <FileDown size={16} /> Export Records
            </button>
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl">
              {(['list', 'grid', 'compact'] as ViewMode[]).map((mode) => (
                <button 
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2.5 rounded-xl transition-all duration-300 ${viewMode === mode ? 'bg-white text-blue-900 shadow-sm scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                  title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`}
                >
                  {mode === 'list' && <LayoutList size={18} />}
                  {mode === 'grid' && <LayoutGrid size={18} />}
                  {mode === 'compact' && <Rows3 size={18} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-24 text-center border border-gray-100 shadow-sm animate-in fade-in duration-500">
            <UserCircle size={64} className="mx-auto text-gray-100 mb-6" />
            <h3 className="text-xl font-bold text-blue-900 mb-2">No matching profiles found</h3>
            <p className="text-gray-400 text-sm font-medium">Try adjusting your filters or search criteria.</p>
            <button 
              onClick={() => { setSearchTerm(''); setDeptFilter('All'); setStatusFilter('All'); setTaskFilter('All'); }}
              className="mt-8 text-xs font-black text-blue-900 uppercase tracking-widest hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="transition-all duration-500">
            {viewMode === 'list' && renderListView()}
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'compact' && renderCompactView()}
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[100] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-blue-900 text-white p-4 rounded-[2.5rem] shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-4 ml-4">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <Hash size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">{selectedIds.length} Profiles Selected</p>
                <p className="text-[10px] font-bold text-white/60 uppercase">Bulk Registry Control</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleBulkDelete}
                className="px-6 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 shadow-xl flex items-center gap-2"
              >
                <Trash2 size={14} /> Bulk Delete
              </button>
              <button 
                onClick={() => setSelectedIds([])}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Profile Modal */}
      {isAddingEmployee && (
        <div className="fixed inset-0 z-[150] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddingEmployee(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-blue-900 text-white">
              <div className="flex items-center gap-4">
                <UserPlus size={24} />
                <h2 className="text-xl font-bold">New Profile</h2>
              </div>
              <button onClick={() => setIsAddingEmployee(false)} className="p-2 hover:bg-white/10 rounded-xl"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddEmployee} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                  <AlertTriangle className="text-red-600 shrink-0" size={18} />
                  <p className="text-xs font-bold text-red-700">{formError}</p>
                </div>
              )}

              {/* SECURITY LEVEL SELECTION */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Security Privilege</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setNewEmp({...newEmp, accessRole: 'Employee'})}
                    className={`flex flex-col items-center gap-3 p-5 rounded-[1.5rem] border-2 transition-all group ${
                      newEmp.accessRole === 'Employee' 
                        ? 'border-blue-900 bg-blue-50 text-blue-900 ring-4 ring-blue-500/5 shadow-sm' 
                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl transition-all ${newEmp.accessRole === 'Employee' ? 'bg-blue-900 text-white' : 'bg-white text-gray-300 group-hover:text-blue-400'}`}>
                      <UserCog size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest">Normal User</p>
                      <p className="text-[9px] font-bold opacity-60 uppercase mt-1">Standard Access</p>
                    </div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewEmp({...newEmp, accessRole: 'HR'})}
                    className={`flex flex-col items-center gap-3 p-5 rounded-[1.5rem] border-2 transition-all group ${
                      newEmp.accessRole === 'HR' 
                        ? 'border-red-600 bg-red-50 text-red-600 ring-4 ring-red-500/5 shadow-sm' 
                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl transition-all ${newEmp.accessRole === 'HR' ? 'bg-red-600 text-white' : 'bg-white text-gray-300 group-hover:text-red-400'}`}>
                      <ShieldCheck size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest">Administrator</p>
                      <p className="text-[9px] font-bold opacity-60 uppercase mt-1">Full System Control</p>
                    </div>
                  </button>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-3">
                   <Shield size={16} className="text-blue-400 shrink-0 mt-0.5" />
                   <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed">
                     {newEmp.accessRole === 'HR' 
                       ? "ALERT: Administrators oversee global inventory, all personnel files, and system overrides." 
                       : "Normal Users are restricted to personal assignments and self-service modules."}
                   </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* HIERARCHY ROLE SELECTION (Only for Administrators) */}
                {newEmp.accessRole === 'HR' && (
                  <div className="space-y-3 p-5 bg-amber-50 rounded-[1.5rem] border border-amber-100">
                    <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Crown size={12} /> Privileged Hierarchy Designation
                    </label>
                    <select 
                      className="w-full px-5 py-4 bg-white border border-amber-200 rounded-2xl outline-none font-bold text-xs text-amber-900 focus:ring-4 focus:ring-amber-500/10 transition-all"
                      value={HIERARCHY_ADMIN_DESIGNATIONS.includes(newEmp.role) ? newEmp.role : ""}
                      onChange={e => setNewEmp({...newEmp, role: e.target.value})}
                    >
                      <option value="">Custom Admin Title...</option>
                      {HIERARCHY_ADMIN_DESIGNATIONS.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <p className="text-[8px] text-amber-600/60 font-bold uppercase tracking-widest">Hierarchy roles automatically inherit master permissions.</p>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Employee ID</label>
                  <div className="relative group mt-1">
                    <Fingerprint className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${!isIdFormatValid && newEmp.employeeId ? 'text-red-400' : 'text-gray-300 group-focus-within:text-blue-900'}`} size={18} />
                    <input 
                      required 
                      placeholder="e.g. SA-005" 
                      className={`w-full pl-12 pr-5 py-4 bg-gray-50 border rounded-2xl outline-none font-bold text-sm transition-all ${
                        !newEmp.employeeId ? 'border-gray-100' : 
                        (!isIdFormatValid || !isIdUnique) ? 'border-red-200 focus:ring-red-500/5 focus:bg-white' : 
                        'border-green-200 focus:ring-green-500/5 focus:bg-white'
                      }`} 
                      value={newEmp.employeeId} 
                      onChange={e => setNewEmp({...newEmp, employeeId: e.target.value.toUpperCase()})} 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                  <input required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Email</label>
                  <input type="email" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Access Token (Password)</label>
                  <div className="relative group mt-1">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-900 transition-colors" size={18} />
                    <input 
                      required 
                      type={showNewEmpPassword ? "text" : "password"}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all text-blue-900" 
                      value={newEmp.password} 
                      onChange={e => setNewEmp({...newEmp, password: e.target.value})} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewEmpPassword(!showNewEmpPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-900 transition-colors"
                    >
                      {showNewEmpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                    <input 
                      required 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all" 
                      value={newEmp.role} 
                      onChange={e => setNewEmp({...newEmp, role: e.target.value})} 
                      placeholder="e.g. Lead Engineer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                    <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})}>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="pt-4 space-y-4">
                <button 
                  type="submit" 
                  disabled={!canSubmit}
                  className={`w-full py-5 text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed ${newEmp.accessRole === 'HR' ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-blue-900 hover:bg-blue-800 shadow-blue-900/20'}`}
                >
                  Initialize {newEmp.accessRole === 'HR' ? 'Admin' : 'Personnel'} Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingEmployee && (
        <div className="fixed inset-0 z-[140] overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewingEmployee(null)} />
          <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-blue-900 uppercase tracking-tighter">Personnel File</h2>
                {activeViewers.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex -space-x-2">
                      {activeViewers.map(v => (
                        <img key={v.id} src={v.avatar} title={`${v.name} is also viewing`} className="w-5 h-5 rounded-full border-2 border-white ring-1 ring-blue-100" alt="" />
                      ))}
                    </div>
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest animate-pulse">
                      {activeViewers.length} manager{activeViewers.length > 1 ? 's' : ''} viewing
                    </span>
                  </div>
                )}
              </div>
              <button onClick={() => setViewingEmployee(null)} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-12 pb-24">
              <div className="flex items-center gap-8">
                <div className="relative">
                  <img src={viewingEmployee.avatar} className="w-28 h-28 rounded-[2.5rem] object-cover shadow-2xl shadow-blue-900/10 border-4 border-white" alt="" />
                  {HIERARCHY_ADMIN_DESIGNATIONS.includes(viewingEmployee.role) && (
                    <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-2xl shadow-xl border-4 border-white">
                      <Crown size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Fingerprint size={12} className="text-blue-900/30" />
                    <span className="text-[10px] font-black text-blue-900/30 uppercase">{viewingEmployee.employeeId}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 tracking-tight">{viewingEmployee.name}</h3>
                  <p className="text-gray-500 font-medium">{viewingEmployee.role}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <AccessBadge emp={viewingEmployee} />
                    <StatusBadge emp={viewingEmployee} />
                  </div>
                </div>
              </div>

              {/* Status Governance Panel */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                  <Activity size={16} className="text-blue-900" /> Lifecycle Controls
                </h4>
                <div className="grid grid-cols-2 gap-3">
                   {isViewedEmpLocked && (
                     <button 
                      onClick={() => unlockEmployee(viewingEmployee.id)} 
                      className="flex items-center justify-center gap-3 p-4 rounded-2xl border border-orange-200 bg-orange-50 text-orange-700 font-black text-[10px] uppercase tracking-widest hover:bg-orange-100 transition-all col-span-2"
                    >
                      <Unlock size={16} /> Force Unlock Account
                    </button>
                   )}
                   <button 
                    onClick={() => updateEmployeeStatus(viewingEmployee.id, 'Active')} 
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                      viewingEmployee.status === 'Active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-100 text-gray-400 hover:border-green-200 hover:text-green-600'
                    }`}
                  >
                    <UserCheck size={16} /> Active
                  </button>
                  <button 
                    onClick={() => updateEmployeeStatus(viewingEmployee.id, 'Inactive')} 
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                      viewingEmployee.status === 'Inactive' ? 'bg-gray-100 border-gray-200 text-gray-600' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                    }`}
                  >
                    <Power size={16} /> Inactive
                  </button>
                  <button 
                    onClick={() => { setEmployeeToFreeze(viewingEmployee); }} 
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                      viewingEmployee.status === 'Frozen' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600'
                    }`}
                  >
                    <Snowflake size={16} /> Freeze
                  </button>
                  <button 
                    onClick={() => { setEmployeeToDelete(viewingEmployee); }} 
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl border border-red-50 text-red-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={16} /> Purge
                  </button>
                </div>
              </div>

              {/* Permissions Governance Panel */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                  <Shield size={16} className="text-blue-900" /> System Permissions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'View CRM', 'Manage CRM', 'View IT Support', 'Manage IT Support',
                    'Field Access', 'Inventory Control', 'HR Management', 'Legal Access',
                    'Manage Expenses'
                  ].map(perm => (
                    <label key={perm} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100 group">
                      <input 
                        type="checkbox" 
                        checked={viewingEmployee.permissions?.includes(perm)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEmployees(prev => prev.map(emp => 
                            emp.id === viewingEmployee.id 
                              ? { 
                                  ...emp, 
                                  permissions: checked 
                                    ? [...(emp.permissions || []), perm] 
                                    : (emp.permissions || []).filter(p => p !== perm)
                                } 
                              : emp
                          ));
                          setViewingEmployee(prev => prev ? {
                            ...prev,
                            permissions: checked 
                              ? [...(prev.permissions || []), perm] 
                              : (prev.permissions || []).filter(p => p !== perm)
                          } : null);
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                      />
                      <span className="text-[10px] font-black text-blue-900 uppercase tracking-tight group-hover:text-blue-800">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Task Management */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                  <ClipboardList size={16} className="text-blue-900" /> Assignments
                </h4>
                <div className="rounded-[2rem] p-6 border bg-gray-50 border-gray-100 space-y-5">
                   <div className="grid grid-cols-1 gap-4">
                     <div className="space-y-1">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned To</label>
                       <input readOnly className="w-full px-5 py-3 bg-white/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 cursor-not-allowed italic" value={viewingEmployee.name} />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Task Definition</label>
                       <input 
                         type="text" 
                         placeholder="e.g. Q3 Performance Audit" 
                         className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-blue-900 outline-none"
                         value={newTaskTitle}
                         onChange={(e) => setNewTaskTitle(e.target.value)}
                       />
                     </div>
                     <button 
                       onClick={addTask}
                       disabled={!newTaskTitle.trim()}
                       className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-800 disabled:opacity-50"
                     >
                       Initialize Assignment
                     </button>
                   </div>
                </div>

                {/* Task Search Bar */}
                <div className="space-y-4">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search assignments..." 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-blue-900 outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white transition-all"
                      value={taskSearchTerm}
                      onChange={(e) => setTaskSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    {filteredMemberTasks.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">No assignments match your search</p>
                      </div>
                    ) : (
                      filteredMemberTasks.map(task => (
                        <div key={task.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          task.status === 'Completed' ? 'bg-green-50/50 border-green-100' :
                          task.status === 'In Progress' ? 'bg-blue-50/50 border-blue-100' :
                          'bg-gray-50 border-gray-100'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${
                              task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              task.status === 'In Progress' ? 'bg-blue-100 text-blue-900' :
                              'bg-white text-gray-400 border border-gray-100'
                            }`}>
                              <Clock size={14} />
                            </div>
                            <div>
                              <span className={`text-xs font-bold ${task.status === 'Completed' ? 'text-green-800 line-through opacity-60' : 'text-blue-900'}`}>{task.title}</span>
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">Due: {task.dueDate}</p>
                            </div>
                          </div>
                          <span className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                            task.status === 'Completed' ? 'bg-green-500 text-white shadow-sm' :
                            task.status === 'In Progress' ? 'bg-blue-900 text-white shadow-sm' :
                            'bg-gray-200 text-gray-600'
                          }`}>{task.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Security Overwrite */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-gray-400 uppercase flex items-center gap-2"><ShieldAlert size={16} className="text-orange-500" /> Security</h4>
                <div className="rounded-[2rem] p-6 border bg-orange-50/50 border-orange-100 space-y-4">
                  <div className="relative">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-200" size={18} />
                      <input 
                        type="password" 
                        placeholder="New access token..." 
                        className="w-full pl-12 pr-12 py-4 bg-white border border-orange-200 rounded-2xl text-sm outline-none font-bold" 
                        value={adminResetPass} 
                        onChange={(e) => setAdminResetPass(e.target.value)} 
                      />
                      <button onClick={handleAdminResetPassword} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 text-white rounded-xl">
                        <UserCheck size={20}/>
                      </button>
                    </div>
                  </div>
                  {resetSuccess && (
                    <div className="flex items-center gap-2 text-[10px] font-black text-green-700 uppercase tracking-widest animate-in fade-in">
                      <CheckCircle size={14} /> Update Committed
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <TwoFactorModal 
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        onVerify={confirmDelete}
        actionName="Delete Employee Record"
      />
    </div>
  );
};

export default Employees;
