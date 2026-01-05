
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Filter, MoreVertical, Plus, Trash2, UserMinus, FolderInput, 
  CheckCircle2, X, ClipboardList, Clock, AlertCircle, CheckCircle, 
  UserPlus, Mail, Briefcase, Building2, ShieldCheck, 
  Calendar as CalendarIcon, UserRoundCheck, ArrowRightLeft, 
  Download, Upload, Snowflake, Power, UserCheck,
  LayoutList, LayoutGrid, Rows3, ChevronDown, ListChecks, Fingerprint, FileText, FileUp, Hash, UserCircle,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  KeyRound,
  History
} from 'lucide-react';
import { DEPARTMENTS } from '../constants';
import { Employee, Task, Document } from '../types';

interface EmployeesProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  addNotification: (userId: string, title: string, message: string) => void;
}

type ViewMode = 'list' | 'grid' | 'compact';
type TaskFilterType = 'All' | 'No Tasks' | 'Has Tasks';

const Employees: React.FC<EmployeesProps> = ({ employees, setEmployees, addNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [idFilter, setIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [taskFilter, setTaskFilter] = useState<TaskFilterType>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const employeeFileInputRef = useRef<HTMLInputElement>(null);
  
  // Slide-over specific task filtering state
  const [taskSearchTerm, setTaskSearchTerm] = useState('');

  // Admin password reset state
  const [adminResetPass, setAdminResetPass] = useState('');
  const [showAdminResetPass, setShowAdminResetPass] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [showInitialPass, setShowInitialPass] = useState(false);
  const [newEmp, setNewEmp] = useState({
    employeeId: '',
    name: '',
    role: '',
    department: DEPARTMENTS[0],
    email: '',
    password: '',
    status: 'Active' as const
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [newTaskStatus, setNewTaskStatus] = useState<Task['status']>('Pending');

  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Reset task search when closing the slide-over
  useEffect(() => {
    if (!viewingEmployee) {
      setTaskSearchTerm('');
      setAdminResetPass('');
      setShowAdminResetPass(false);
      setResetSuccess(false);
    }
  }, [viewingEmployee]);

  const filteredEmployees = employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    const idTerm = idFilter.toLowerCase();
    
    const matchesSearch = 
      emp.name.toLowerCase().includes(term) ||
      emp.role.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term);
    
    const matchesId = !idFilter || emp.employeeId.toLowerCase().includes(idTerm);
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    
    const hasTasks = emp.tasks && emp.tasks.length > 0;
    const matchesTasks = 
      taskFilter === 'All' ? true :
      taskFilter === 'No Tasks' ? !hasTasks :
      taskFilter === 'Has Tasks' ? hasTasks : true;

    return matchesSearch && matchesId && matchesStatus && matchesDept && matchesTasks;
  });

  const handleUpdateStatus = (id: string, newStatus: Employee['status']) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, status: newStatus } : emp
    ));
    addNotification(id, `Status Update: ${newStatus}`, `Your account access has been set to ${newStatus}.`);
    setMenuOpenId(null);
  };

  const handleBulkStatusUpdate = (newStatus: Employee['status']) => {
    setEmployees(prev => prev.map(emp => 
      selectedIds.includes(emp.id) ? { ...emp, status: newStatus } : emp
    ));
    selectedIds.forEach(id => {
      addNotification(id, `Bulk Status Update`, `Your status was updated to ${newStatus} by HR.`);
    });
    setSelectedIds([]);
  };

  const handleBulkPasswordReset = () => {
    const newPass = prompt(`BULK CREDENTIAL RESET:\n\nEnter a new access token for the ${selectedIds.length} selected employees:`);
    if (!newPass) return;

    if (newPass.length < 6) {
      alert("Error: Password must be at least 6 characters.");
      return;
    }

    const confirmed = window.confirm(`Confirm bulk password reset for ${selectedIds.length} employees to: "${newPass}"?`);
    if (!confirmed) return;

    setEmployees(prev => prev.map(emp => 
      selectedIds.includes(emp.id) ? { ...emp, password: newPass } : emp
    ));

    selectedIds.forEach(id => {
      addNotification(
        id,
        "System Credential Reset",
        "HR has performed a bulk update of organization access tokens. Your new password has been set by the administrator."
      );
    });

    alert(`Success: Credentials for ${selectedIds.length} personnel have been updated.`);
    setSelectedIds([]);
  };

  const handleDownloadData = () => {
    const dataToExport = selectedIds.length > 0 
      ? employees.filter(e => selectedIds.includes(e.id))
      : employees;
      
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `srinidhi_profiles_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const employee: Employee = {
      id: `emp-${Date.now()}`,
      ...newEmp,
      avatar: `https://picsum.photos/seed/${newEmp.name.replace(/\s+/g, '')}/100/100`,
      joinDate: new Date().toISOString().split('T')[0],
      tasks: [],
      documents: []
    };
    setEmployees([employee, ...employees]);
    setIsAddingEmployee(false);
    setNewEmp({ employeeId: '', name: '', role: '', department: DEPARTMENTS[0], email: '', password: '', status: 'Active' });
    setShowInitialPass(false);
  };

  const handleAdminResetPassword = () => {
    if (!viewingEmployee || !adminResetPass.trim()) return;

    const confirmed = window.confirm(
      `ADMINISTRATIVE OVERRIDE WARNING:\n\n` +
      `You are about to force-reset the access token for ${viewingEmployee.name} (${viewingEmployee.employeeId}).\n\n` +
      `New Token: ${adminResetPass}\n\n` +
      `The personnel will be notified of this manual credential change. Proceed?`
    );

    if (!confirmed) return;

    setEmployees(prev => prev.map(emp => 
      emp.id === viewingEmployee.id ? { ...emp, password: adminResetPass } : emp
    ));

    addNotification(
      viewingEmployee.id,
      "Manual Credential Reset",
      "HR has manually updated your organization access token. Please contact your manager for the new credentials if you did not request this."
    );

    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
    setAdminResetPass('');
  };

  const addTask = () => {
    if (!viewingEmployee || !newTaskTitle.trim()) return;

    const confirmAssignment = window.confirm(
      `Please verify the directive details:\n\n` +
      `Title: ${newTaskTitle}\n` +
      `Priority: ${newTaskPriority}\n` +
      `Due Date: ${newTaskDueDate}\n` +
      `Assigned to: ${viewingEmployee.name}\n\n` +
      `Is this information correct?`
    );

    if (!confirmAssignment) return;

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
    
    addNotification(
      viewingEmployee.id, 
      "New Directive Assigned", 
      `HR has assigned a new directive: "${newTaskTitle}". Priority: ${newTaskPriority}. Due: ${newTaskDueDate}.`
    );

    setNewTaskTitle('');
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    if (!viewingEmployee) return;

    // Specific confirmation for 'In Progress' status
    if (newStatus === 'In Progress') {
      const confirmed = window.confirm(`Set directive "${viewingEmployee.tasks?.find(t => t.id === taskId)?.title}" to 'In Progress'? This confirms the personnel has started this workload.`);
      if (!confirmed) return;
    }

    setEmployees(prev => prev.map(emp => {
      if (emp.id === viewingEmployee.id) {
        return {
          ...emp,
          tasks: (emp.tasks || []).map(t => t.id === taskId ? { ...t, status: newStatus } : t)
        };
      }
      return emp;
    }));

    setViewingEmployee(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tasks: (prev.tasks || []).map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      };
    });

    addNotification(
      viewingEmployee.id,
      "Directive Status Updated",
      `The status of your directive has been updated to "${newStatus}" by HR.`
    );
  };

  const handleEmployeeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viewingEmployee) return;

    setIsUploadingDoc(true);
    // Simulate upload delay
    setTimeout(() => {
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
      
      const newDoc: Document = {
        id: `edoc-${Date.now()}`,
        name: file.name,
        type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
        uploadDate: now.toISOString().split('T')[0],
        status: 'Pending',
        statusHistory: [{ status: 'Pending', timestamp }]
      };

      setEmployees(prev => prev.map(emp => 
        emp.id === viewingEmployee.id ? { ...emp, documents: [...(emp.documents || []), newDoc] } : emp
      ));
      setViewingEmployee(prev => prev ? { ...prev, documents: [...(prev.documents || []), newDoc] } : null);
      
      addNotification(
        viewingEmployee.id,
        "New Document Uploaded",
        `HR has uploaded a new document to your record: "${file.name}".`
      );
      
      setIsUploadingDoc(false);
      if (employeeFileInputRef.current) employeeFileInputRef.current.value = '';
    }, 1200);
  };

  const verifyEmployeeDoc = (docId: string) => {
    if (!viewingEmployee) return;
    
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    setEmployees(prev => prev.map(emp => {
      if (emp.id === viewingEmployee.id) {
        const updatedDocs = (emp.documents || []).map(doc => {
          if (doc.id === docId) {
            const history = doc.statusHistory || [];
            return {
              ...doc,
              status: 'Verified' as const,
              statusHistory: [...history, { status: 'Verified' as const, timestamp }]
            };
          }
          return doc;
        });
        return { ...emp, documents: updatedDocs };
      }
      return emp;
    }));

    // Update the local slide-over view too
    setViewingEmployee(prev => {
      if (!prev) return null;
      const updatedDocs = (prev.documents || []).map(doc => {
        if (doc.id === docId) {
          const history = doc.statusHistory || [];
          return {
            ...doc,
            status: 'Verified' as const,
            statusHistory: [...history, { status: 'Verified' as const, timestamp }]
          };
        }
        return doc;
      });
      return { ...prev, documents: updatedDocs };
    });

    addNotification(
      viewingEmployee.id,
      "Document Verified",
      `Your document "${viewingEmployee.documents?.find(d => d.id === docId)?.name}" has been verified and approved by HR.`
    );
  };

  const deleteEmployeeDoc = (docId: string) => {
    if (!viewingEmployee || !window.confirm('Remove this document from personnel file?')) return;

    setEmployees(prev => prev.map(emp => 
      emp.id === viewingEmployee.id ? { ...emp, documents: (emp.documents || []).filter(d => d.id !== docId) } : emp
    ));
    setViewingEmployee(prev => prev ? { ...prev, documents: (prev.documents || []).filter(d => d.id !== docId) } : null);
  };

  const StatusBadge = ({ status }: { status: Employee['status'] }) => (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
      status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
      status === 'On Leave' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
      status === 'Frozen' ? 'bg-blue-50 text-blue-700 border-blue-100' :
      'bg-gray-100 text-gray-500 border-gray-200'
    }`}>
      {status}
    </span>
  );

  const ActionMenu = ({ emp }: { emp: Employee }) => (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === emp.id ? null : emp.id); }}
        className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-blue-900 transition-all"
      >
        <MoreVertical size={18} />
      </button>

      {menuOpenId === emp.id && (
        <div className="absolute right-0 top-10 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1">
            <button onClick={() => handleUpdateStatus(emp.id, 'Active')} className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-green-700 hover:bg-green-50 flex items-center gap-3"><UserCheck size={14}/> Activate</button>
            <button onClick={() => handleUpdateStatus(emp.id, 'Frozen')} className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 flex items-center gap-3"><Snowflake size={14}/> Freeze</button>
            <button onClick={() => handleUpdateStatus(emp.id, 'Inactive')} className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3"><Power size={14}/> Deactivate</button>
            <div className="h-[1px] bg-gray-50 my-1" />
            <button onClick={() => setViewingEmployee(emp)} className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-3"><ClipboardList size={14}/> Manage File</button>
          </div>
        </div>
      )}
    </div>
  );

  const filteredViewingTasks = viewingEmployee ? (viewingEmployee.tasks || []).filter(task => 
    task.title.toLowerCase().includes(taskSearchTerm.toLowerCase())
  ) : [];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Personnel Profiles</h1>
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

      {/* Filters & View Switcher */}
      <div className="flex flex-col xl:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search profiles by name, role, email..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-900/20 transition-all shadow-sm font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Profile ID Filter */}
          <div className="flex-1 xl:flex-none relative min-w-[140px]">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="ID Filter"
              className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-900/20 transition-all shadow-sm font-bold text-xs uppercase tracking-widest placeholder:text-gray-300"
              value={idFilter}
              onChange={(e) => setIdFilter(e.target.value)}
            />
          </div>

          <div className="flex-1 xl:flex-none relative min-w-[160px]">
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-2xl outline-none appearance-none text-xs font-bold uppercase tracking-wider text-gray-600 shadow-sm cursor-pointer"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>

          <div className="flex-1 xl:flex-none relative min-w-[140px]">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-2xl outline-none appearance-none text-xs font-bold uppercase tracking-wider text-gray-600 shadow-sm cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Frozen">Frozen</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>

          <div className="flex items-center gap-1 p-1.5 bg-gray-100 rounded-[1.25rem]">
            {(['list', 'grid', 'compact'] as ViewMode[]).map((mode) => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === mode 
                    ? 'bg-white text-blue-900 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {mode === 'list' && <LayoutList size={20} />}
                {mode === 'grid' && <LayoutGrid size={20} />}
                {mode === 'compact' && <Rows3 size={20} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-blue-900 text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-8 border border-white/20 backdrop-blur-lg">
            <div className="flex items-center gap-3 pr-8 border-r border-white/10">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center font-black text-sm">
                {selectedIds.length}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">Selected</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => handleBulkStatusUpdate('Active')} className="p-2.5 hover:bg-white/10 rounded-xl transition-all" title="Bulk Activate"><UserCheck size={18}/></button>
              <button onClick={() => handleBulkStatusUpdate('Frozen')} className="p-2.5 hover:bg-white/10 rounded-xl transition-all" title="Bulk Freeze"><Snowflake size={18}/></button>
              <button onClick={handleBulkPasswordReset} className="p-2.5 hover:bg-orange-500 rounded-xl transition-all" title="Bulk Credential Reset"><KeyRound size={18}/></button>
              <button onClick={handleDownloadData} className="p-2.5 hover:bg-white/10 rounded-xl transition-all" title="Export Selected"><Download size={18}/></button>
              <div className="w-[1px] h-6 bg-white/10 mx-2" />
              <button onClick={() => setSelectedIds([])} className="p-2.5 hover:bg-red-500 rounded-xl transition-all" title="Clear Selection"><X size={18}/></button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-[400px]">
        {filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm">
            <UserCircle size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-blue-900">No profiles found</h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-2">Adjust your filters or try a different search term.</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-5 w-10">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-blue-900 accent-blue-900"
                          checked={selectedIds.length === filteredEmployees.length}
                          onChange={() => selectedIds.length === filteredEmployees.length ? setSelectedIds([]) : setSelectedIds(filteredEmployees.map(e => e.id))}
                        />
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredEmployees.map(emp => (
                      <tr key={emp.id} onClick={() => setViewingEmployee(emp)} className={`hover:bg-blue-50/30 transition-all group cursor-pointer ${selectedIds.includes(emp.id) ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-blue-900 accent-blue-900"
                            checked={selectedIds.includes(emp.id)}
                            onChange={() => setSelectedIds(prev => prev.includes(emp.id) ? prev.filter(i => i !== emp.id) : [...prev, emp.id])}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-bold text-gray-400">{emp.employeeId}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <img src={emp.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover border border-white shadow-sm" />
                            <div>
                              <p className="text-sm font-bold text-blue-900">{emp.name}</p>
                              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">{emp.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{emp.department}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={emp.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ActionMenu emp={emp} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
                {filteredEmployees.map(emp => (
                  <div 
                    key={emp.id}
                    onClick={() => setViewingEmployee(emp)}
                    className={`bg-white rounded-[2.5rem] p-6 border transition-all hover:shadow-xl hover:-translate-y-1 group relative cursor-pointer ${
                      selectedIds.includes(emp.id) ? 'border-blue-900 ring-2 ring-blue-900/10' : 'border-gray-100'
                    }`}
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <ActionMenu emp={emp} />
                    </div>
                    
                    <div className="absolute top-6 left-6" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-blue-900 accent-blue-900"
                        checked={selectedIds.includes(emp.id)}
                        onChange={() => setSelectedIds(prev => prev.includes(emp.id) ? prev.filter(i => i !== emp.id) : [...prev, emp.id])}
                      />
                    </div>

                    <div className="flex flex-col items-center text-center mt-2">
                      <div className="relative mb-4">
                        <img src={emp.avatar} alt="" className="w-24 h-24 rounded-[2rem] object-cover shadow-2xl shadow-blue-900/10 border-4 border-white" />
                        <div className="absolute -bottom-1 -right-1">
                          <StatusBadge status={emp.status} />
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-blue-900/20 uppercase tracking-widest mb-1">{emp.employeeId}</span>
                        <h3 className="text-lg font-bold text-blue-900">{emp.name}</h3>
                        <p className="text-xs font-black text-blue-900/40 uppercase tracking-[0.15em] mt-1">{emp.role}</p>
                      </div>
                      
                      <div className="mt-4 py-1 px-3 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Building2 size={12}/> {emp.department}
                      </div>

                      <div className="w-full mt-6 pt-6 border-t border-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Tasks</span>
                          <span className="text-[10px] font-bold text-blue-900">
                            {emp.tasks?.filter(t => t.status === 'Completed').length || 0}/{emp.tasks?.length || 0}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-900 transition-all duration-700" 
                            style={{ width: `${emp.tasks?.length ? (emp.tasks.filter(t => t.status === 'Completed').length / emp.tasks.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'compact' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 w-8">
                         <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 rounded border-gray-300 text-blue-900 accent-blue-900"
                          checked={selectedIds.length === filteredEmployees.length}
                          onChange={() => selectedIds.length === filteredEmployees.length ? setSelectedIds([]) : setSelectedIds(filteredEmployees.map(e => e.id))}
                        />
                      </th>
                      <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
                      <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                      <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                      <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Dept</th>
                      <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredEmployees.map(emp => (
                      <tr key={emp.id} onClick={() => setViewingEmployee(emp)} className={`hover:bg-blue-50/20 transition-all cursor-pointer ${selectedIds.includes(emp.id) ? 'bg-blue-50/40' : ''}`}>
                        <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                           <input 
                            type="checkbox" 
                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-900 accent-blue-900"
                            checked={selectedIds.includes(emp.id)}
                            onChange={() => setSelectedIds(prev => prev.includes(emp.id) ? prev.filter(i => i !== emp.id) : [...prev, emp.id])}
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="text-[10px] font-bold text-gray-400">{emp.employeeId}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img src={emp.avatar} alt="" className="w-6 h-6 rounded-lg object-cover shadow-sm" />
                            <span className="text-xs font-bold text-blue-900">{emp.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="text-[11px] text-gray-500 font-medium">{emp.role}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="text-[9px] font-black text-gray-400 uppercase">{emp.department}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <StatusBadge status={emp.status} />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <ActionMenu emp={emp} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {isAddingEmployee && (
        <div className="fixed inset-0 z-[150] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddingEmployee(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-blue-900 text-white">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/10 rounded-2xl"><UserPlus size={24} /></div>
                <div>
                  <h2 className="text-xl font-bold">New Profile</h2>
                  <p className="text-[10px] text-blue-200 uppercase font-black tracking-[0.2em] mt-0.5">Profile Initialization</p>
                </div>
              </div>
              <button onClick={() => setIsAddingEmployee(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Profile ID</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input required placeholder="e.g. SA-005" className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all font-bold text-sm" value={newEmp.employeeId} onChange={e => setNewEmp({...newEmp, employeeId: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Full Legal Identity</label>
                  <input required placeholder="Robert J. Oppenheimer" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all font-bold text-sm" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Professional Email</label>
                  <input type="email" required placeholder="robert@srinidhi.com" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all font-bold text-sm" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} />
                </div>
                
                {/* New Password Field */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Initial Access Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type={showInitialPass ? "text" : "password"} 
                      required 
                      placeholder="••••••••" 
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all font-bold text-sm" 
                      value={newEmp.password} 
                      onChange={e => setNewEmp({...newEmp, password: e.target.value})} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowInitialPass(!showInitialPass)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-900 transition-colors"
                    >
                      {showInitialPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Position</label>
                    <input required placeholder="Lead Scientist" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all font-bold text-sm" value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Department</label>
                    <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none appearance-none font-bold text-sm" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})}>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95">Initialize Profile</button>
            </form>
          </div>
        </div>
      )}

      {viewingEmployee && (
        <div className="fixed inset-0 z-[140] overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewingEmployee(null)} />
          <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-900">Comprehensive Profile</h2>
              <button onClick={() => setViewingEmployee(null)} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-10">
              <div className="flex items-center gap-8">
                <img src={viewingEmployee.avatar} className="w-28 h-28 rounded-[2.5rem] object-cover shadow-2xl shadow-blue-900/10 border-4 border-white" alt="" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Fingerprint size={12} className="text-blue-900/30" />
                    <span className="text-[10px] font-black text-blue-900/30 uppercase tracking-[0.2em]">{viewingEmployee.employeeId}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 leading-tight">{viewingEmployee.name}</h3>
                  <p className="text-gray-500 font-medium">{viewingEmployee.role}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={viewingEmployee.status} />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest border px-2 py-0.5 rounded-lg">{viewingEmployee.department}</span>
                  </div>
                </div>
              </div>

              {/* Administrative Access Control Section */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={16} className="text-orange-500" /> Administrative Access Control
                </h4>
                <div className={`rounded-[2rem] p-6 border transition-all duration-500 space-y-4 ${resetSuccess ? 'bg-green-50 border-green-200' : 'bg-orange-50/50 border-orange-100'}`}>
                  {resetSuccess ? (
                    <div className="flex flex-col items-center text-center py-4 space-y-2 animate-in fade-in zoom-in-95">
                      <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle size={24} />
                      </div>
                      <p className="text-sm font-bold text-green-700">Token Successfully Overwritten</p>
                      <p className="text-[10px] text-green-600 uppercase font-black tracking-widest">Personnel notified via dashboard</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-bold text-orange-700 uppercase tracking-widest flex items-center gap-2">
                        <Fingerprint size={12}/> Overwrite Personnel Credentials
                      </p>
                      <div className="relative">
                        <input 
                          type={showAdminResetPass ? "text" : "password"} 
                          placeholder="Input new access token..." 
                          className="w-full px-6 py-4 bg-white border border-orange-200 rounded-2xl text-sm outline-none font-bold shadow-sm focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20" 
                          value={adminResetPass} 
                          onChange={(e) => setAdminResetPass(e.target.value)} 
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAdminResetPassword(); }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowAdminResetPass(!showAdminResetPass)}
                          className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-900"
                        >
                          {showAdminResetPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button 
                          onClick={handleAdminResetPassword}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-md active:scale-95"
                          title="Commit Reset"
                        >
                          <ShieldCheck size={20}/>
                        </button>
                      </div>
                      <p className="text-[9px] text-orange-600/70 italic leading-relaxed">Warning: This action triggers an audit log and notifies the employee. Press enter to finalize.</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FolderInput size={16} /> Personnel Documents
                  </h4>
                  <button 
                    onClick={() => employeeFileInputRef.current?.click()}
                    className="p-2 bg-blue-50 text-blue-900 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                  >
                    {isUploadingDoc ? <Loader2 className="animate-spin" size={12} /> : <Plus size={12} />}
                    Add File
                  </button>
                  <input 
                    type="file" 
                    ref={employeeFileInputRef} 
                    className="hidden" 
                    onChange={handleEmployeeFileUpload}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {(viewingEmployee.documents || []).length === 0 ? (
                    <div className="text-center py-10 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-gray-400 font-bold italic text-xs uppercase tracking-widest">No documents on file</div>
                  ) : (
                    (viewingEmployee.documents || []).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-100 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-blue-900 truncate max-w-[180px]">{doc.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] font-black text-gray-300 uppercase">{doc.type}</span>
                              <span className="text-[9px] font-bold text-gray-400">{doc.uploadDate}</span>
                              <span className={`text-[8px] font-black ml-2 px-1 rounded-sm uppercase ${doc.status === 'Verified' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                                {doc.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                           {doc.status !== 'Verified' && (
                             <button 
                               onClick={() => verifyEmployeeDoc(doc.id)}
                               className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                               title="Verify Document"
                             >
                               <ShieldCheck size={18} />
                             </button>
                           )}
                           <button onClick={() => deleteEmployeeDoc(doc.id)} className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition-all">
                            <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <ClipboardList size={16} /> Active Directives
                  </h4>
                </div>

                <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 space-y-4 shadow-inner">
                  <div className="relative">
                    <input type="text" placeholder="Assign new directive..." className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm outline-none font-bold shadow-sm" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
                    <button onClick={addTask} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-all"><Plus size={20}/></button>
                  </div>
                </div>

                <div className="relative px-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search directives..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs outline-none font-bold shadow-sm focus:ring-2 focus:ring-blue-900/5 transition-all"
                    value={taskSearchTerm}
                    onChange={(e) => setTaskSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  {(viewingEmployee.tasks || []).length === 0 ? (
                    <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-gray-400 font-bold italic text-xs uppercase tracking-widest">Clear Schedule</div>
                  ) : filteredViewingTasks.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50/50 rounded-3xl border border-dashed border-gray-100 text-gray-400 font-bold italic text-[10px] uppercase tracking-widest">No matching directives</div>
                  ) : (
                    filteredViewingTasks.map(task => (
                      <div key={task.id} className={`p-5 rounded-[1.75rem] border transition-all flex flex-col gap-4 ${task.status === 'Completed' ? 'bg-gray-50/50 border-gray-100 opacity-60' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${task.status === 'Completed' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                            <div>
                              <p className="text-sm font-bold text-blue-900">{task.title}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Due {task.dueDate}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${task.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{task.priority}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mr-auto">Status:</span>
                          {(['Pending', 'In Progress', 'Completed'] as Task['status'][]).map(status => (
                            <button
                              key={status}
                              onClick={() => handleUpdateTaskStatus(task.id, status)}
                              className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                                task.status === status
                                  ? status === 'Completed' ? 'bg-green-100 border-green-200 text-green-700' : 
                                    status === 'In Progress' ? 'bg-blue-100 border-blue-200 text-blue-700' : 
                                    'bg-gray-100 border-gray-200 text-gray-600'
                                  : 'bg-white border-gray-100 text-gray-300 hover:border-blue-100 hover:text-blue-900'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`animate-spin ${className}`}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export default Employees;
