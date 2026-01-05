
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, MoreVertical, Plus, Trash2, X, ClipboardList, CheckCircle, 
  UserPlus, Building2, ShieldCheck, Download, Snowflake, Power, UserCheck,
  LayoutList, LayoutGrid, Rows3, ChevronDown, Fingerprint, FileText, Hash, UserCircle,
  Lock, Eye, EyeOff, ShieldAlert, KeyRound, AlertTriangle, Loader2, FolderInput
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
  
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
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
      addNotification(id, "System Credential Reset", "HR has performed a bulk update of organization access tokens.");
    });

    alert(`Success: Credentials updated.`);
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
    setFormError(null);

    // 1. Format Validation: SA-XXX (exactly 3 digits)
    const idRegex = /^SA-\d{3}$/;
    if (!idRegex.test(newEmp.employeeId)) {
      setFormError("Employee ID must follow the format 'SA-XXX' (e.g., SA-001, SA-999).");
      return;
    }

    // 2. Uniqueness Validation
    const isDuplicate = employees.some(emp => emp.employeeId.toUpperCase() === newEmp.employeeId.toUpperCase());
    if (isDuplicate) {
      setFormError(`Conflict: Employee ID '${newEmp.employeeId}' is already assigned to another profile.`);
      return;
    }

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
    setFormError(null);
  };

  const handleAdminResetPassword = () => {
    if (!viewingEmployee || !adminResetPass.trim()) return;
    setEmployees(prev => prev.map(emp => 
      emp.id === viewingEmployee.id ? { ...emp, password: adminResetPass } : emp
    ));
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
    setNewTaskTitle('');
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    if (!viewingEmployee) return;
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
            onClick={() => {
              setIsAddingEmployee(true);
              setFormError(null);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-800 shadow-lg shadow-blue-900/10 transition-all active:scale-95"
          >
            <Plus size={18} /> Create Profile
          </button>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col xl:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search profiles by name, role, email..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex-1 xl:flex-none relative min-w-[140px]">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="ID Filter"
              className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none shadow-sm font-bold text-xs uppercase tracking-widest"
              value={idFilter}
              onChange={(e) => setIdFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 p-1.5 bg-gray-100 rounded-[1.25rem]">
            {(['list', 'grid', 'compact'] as ViewMode[]).map((mode) => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-xl transition-all ${viewMode === mode ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {mode === 'list' && <LayoutList size={20} />}
                {mode === 'grid' && <LayoutGrid size={20} />}
                {mode === 'compact' && <Rows3 size={20} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm">
            <UserCircle size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-blue-900">No profiles found</h3>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Employee ID</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} onClick={() => setViewingEmployee(emp)} className="hover:bg-blue-50/30 transition-all cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400">{emp.employeeId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <img src={emp.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover" />
                        <div>
                          <p className="text-sm font-bold text-blue-900">{emp.name}</p>
                          <p className="text-[11px] text-gray-400 font-bold uppercase">{emp.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-500 uppercase">{emp.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={emp.status} /></td>
                    <td className="px-6 py-4 text-right"><ActionMenu emp={emp} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
            <form onSubmit={handleAddEmployee} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                  <AlertTriangle className="text-red-600 shrink-0" size={18} />
                  <p className="text-xs font-bold text-red-700">{formError}</p>
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2 ml-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee ID</label>
                    <span className="text-[8px] font-black text-blue-900/40 uppercase">Required: SA-XXX</span>
                  </div>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      required 
                      placeholder="e.g. SA-005" 
                      className={`w-full pl-12 pr-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-4 transition-all font-bold text-sm ${
                        formError && formError.includes('ID') ? 'border-red-200 focus:ring-red-500/5' : 'border-gray-100 focus:ring-blue-500/5 focus:bg-white'
                      }`} 
                      value={newEmp.employeeId} 
                      onChange={e => {
                        setFormError(null);
                        setNewEmp({...newEmp, employeeId: e.target.value.toUpperCase()});
                      }} 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                  <input required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all font-bold text-sm" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Email</label>
                  <input type="email" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all font-bold text-sm" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type={showInitialPass ? "text" : "password"} 
                      required 
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all font-bold text-sm" 
                      value={newEmp.password} 
                      onChange={e => setNewEmp({...newEmp, password: e.target.value})} 
                    />
                    <button type="button" onClick={() => setShowInitialPass(!showInitialPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showInitialPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Position</label>
                    <input required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                    <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})}>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all">Initialize Profile</button>
            </form>
          </div>
        </div>
      )}

      {viewingEmployee && (
        <div className="fixed inset-0 z-[140] overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewingEmployee(null)} />
          <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-900">Personnel File</h2>
              <button onClick={() => setViewingEmployee(null)} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-10">
              <div className="flex items-center gap-8">
                <img src={viewingEmployee.avatar} className="w-28 h-28 rounded-[2.5rem] object-cover shadow-2xl shadow-blue-900/10 border-4 border-white" alt="" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Fingerprint size={12} className="text-blue-900/30" />
                    <span className="text-[10px] font-black text-blue-900/30 uppercase">{viewingEmployee.employeeId}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">{viewingEmployee.name}</h3>
                  <p className="text-gray-500 font-medium">{viewingEmployee.role}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={viewingEmployee.status} />
                    <span className="text-[9px] font-black text-gray-400 uppercase border px-2 py-0.5 rounded-lg">{viewingEmployee.department}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs font-black text-gray-400 uppercase flex items-center gap-2"><ShieldAlert size={16} className="text-orange-500" /> Access Overwrite</h4>
                <div className="rounded-[2rem] p-6 border bg-orange-50/50 border-orange-100 space-y-4">
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="Input new access token..." 
                      className="w-full px-6 py-4 bg-white border border-orange-200 rounded-2xl text-sm outline-none font-bold" 
                      value={adminResetPass} 
                      onChange={(e) => setAdminResetPass(e.target.value)} 
                    />
                    <button onClick={handleAdminResetPassword} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 text-white rounded-xl"><ShieldCheck size={20}/></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
