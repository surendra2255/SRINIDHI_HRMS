
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Filter, MoreVertical, Plus, Trash2, UserMinus, FolderInput, 
  CheckCircle2, X, ClipboardList, Clock, AlertCircle, CheckCircle, 
  UserPlus, Mail, Briefcase, Building2, ShieldCheck, 
  Calendar as CalendarIcon, UserRoundCheck, ArrowRightLeft, 
  Download, Upload, Snowflake, Power, UserCheck,
  LayoutList, LayoutGrid, Rows3
} from 'lucide-react';
import { DEPARTMENTS } from '../constants';
import { Employee, Task } from '../types';

interface EmployeesProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  addNotification: (userId: string, title: string, message: string) => void;
}

type ViewMode = 'list' | 'grid' | 'compact';

const Employees: React.FC<EmployeesProps> = ({ employees, setEmployees, addNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [reassigningTaskId, setReassigningTaskId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newEmp, setNewEmp] = useState({
    name: '',
    role: '',
    department: DEPARTMENTS[0],
    email: '',
    status: 'Active' as const
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [newTaskStatus, setNewTaskStatus] = useState<Task['status']>('Pending');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = (id: string, newStatus: Employee['status']) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, status: newStatus } : emp
    ));
    
    const statusMsg = newStatus === 'Frozen' ? 'Your access has been temporarily frozen for security review.' : 
                     newStatus === 'Active' ? 'Your account access has been restored to Active status.' :
                     'Your account has been deactivated by the HR department.';
    
    addNotification(id, `Status Update: ${newStatus}`, statusMsg);
    setMenuOpenId(null);
  };

  const handleDownloadData = () => {
    const dataStr = JSON.stringify(employees, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `srinidhi_personnel_db_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const isValid = json.every(item => item.id && item.name);
          if (isValid) {
            setEmployees(json);
            alert(`Database successfully synchronized with ${json.length} records.`);
          } else {
            alert("Invalid data format. Please provide a valid employee JSON array.");
          }
        }
      } catch (err) {
        alert("Error parsing file. Please ensure it is a valid JSON database file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmployees.map(e => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.role || !newEmp.email) {
      alert("Please fill in all required fields.");
      return;
    }

    const employee: Employee = {
      id: `emp-${Date.now()}`,
      ...newEmp,
      avatar: `https://picsum.photos/seed/${newEmp.name.replace(/\s+/g, '')}/100/100`,
      joinDate: new Date().toISOString().split('T')[0],
      tasks: []
    };

    setEmployees([employee, ...employees]);
    setIsAddingEmployee(false);
    setNewEmp({ name: '', role: '', department: DEPARTMENTS[0], email: '', status: 'Active' });
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

    setEmployees(prev => prev.map(emp => {
      if (emp.id === viewingEmployee.id) {
        const updatedTasks = [...(emp.tasks || []), newTask];
        return { ...emp, tasks: updatedTasks };
      }
      return emp;
    }));

    setViewingEmployee(prev => prev ? { ...prev, tasks: [...(prev.tasks || []), newTask] } : null);
    addNotification(viewingEmployee.id, "New Task Assigned", `HR has assigned you a new task: "${newTaskTitle}"`);

    setNewTaskTitle('');
    setNewTaskStatus('Pending');
    setNewTaskPriority('Medium');
    setNewTaskDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  };

  const toggleTaskStatus = (taskId: string) => {
    if (!viewingEmployee) return;

    const taskToUpdate = viewingEmployee.tasks?.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    const nextStatusMap: Record<string, Task['status']> = {
      'Pending': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'Pending'
    };

    const nextStatus = nextStatusMap[taskToUpdate.status];

    if (nextStatus === 'Completed') {
      const confirmed = window.confirm(`Are you sure you want to mark "${taskToUpdate.title}" as completed?`);
      if (!confirmed) return;
    }

    setEmployees(prev => prev.map(emp => {
      if (emp.id === viewingEmployee.id) {
        const updatedTasks = (emp.tasks || []).map(task => {
          if (task.id === taskId) return { ...task, status: nextStatus };
          return task;
        });
        return { ...emp, tasks: updatedTasks };
      }
      return emp;
    }));

    setViewingEmployee(prev => {
      if(!prev) return null;
      return {
        ...prev,
        tasks: (prev.tasks || []).map(t => t.id === taskId ? { ...t, status: nextStatus } : t)
      };
    });
  };

  const handleReassign = (taskId: string, targetId: string) => {
    if (!viewingEmployee) return;
    const taskToMove = viewingEmployee.tasks?.find(t => t.id === taskId);
    const targetEmp = employees.find(e => e.id === targetId);
    
    if (!taskToMove || !targetEmp) return;

    setEmployees(prev => prev.map(emp => {
      if (emp.id === viewingEmployee.id) {
        return { ...emp, tasks: (emp.tasks || []).filter(t => t.id !== taskId) };
      }
      if (emp.id === targetId) {
        return { ...emp, tasks: [...(emp.tasks || []), taskToMove] };
      }
      return emp;
    }));

    setViewingEmployee(prev => prev ? { 
      ...prev, 
      tasks: (prev.tasks || []).filter(t => t.id !== taskId) 
    } : null);

    addNotification(targetId, "Task Reassigned to You", `Task "${taskToMove.title}" has been reassigned to you from ${viewingEmployee.name}.`);
    setReassigningTaskId(null);
  };

  const StatusBadge = ({ status }: { status: Employee['status'] }) => (
    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
      status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
      status === 'On Leave' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
      status === 'Frozen' ? 'bg-blue-50 text-blue-700 border-blue-100' :
      'bg-gray-50 text-gray-700 border-gray-200'
    }`}>
      {status}
    </span>
  );

  const ActionMenu = ({ emp }: { emp: Employee }) => (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === emp.id ? null : emp.id); }}
        className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 rounded-xl text-gray-400 hover:text-blue-900 transition-all"
      >
        <MoreVertical size={18} />
      </button>

      {menuOpenId === emp.id && (
        <div className="absolute right-0 top-10 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1">
            <button 
              onClick={() => handleUpdateStatus(emp.id, 'Active')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-green-700 hover:bg-green-50 transition-colors uppercase tracking-tight"
            >
              <UserCheck size={16} /> Activate User
            </button>
            <button 
              onClick={() => handleUpdateStatus(emp.id, 'Inactive')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors uppercase tracking-tight"
            >
              <Power size={16} /> Deactivate User
            </button>
            <button 
              onClick={() => handleUpdateStatus(emp.id, 'Frozen')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors uppercase tracking-tight"
            >
              <Snowflake size={16} /> Freeze Account
            </button>
            <div className="h-[1px] bg-gray-50 my-1 mx-2" />
            <button 
               onClick={() => setViewingEmployee(emp)}
               className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors uppercase tracking-tight"
            >
              <ClipboardList size={16} /> Manage Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Employee Directory</h1>
          <p className="text-gray-500">Manage organizational members and perform bulk actions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUploadData} 
            accept=".json" 
            className="hidden" 
          />
          <button 
            onClick={handleDownloadData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
            title="Download Full Database"
          >
            <Download size={16} /> Export
          </button>
          <button 
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
            title="Upload/Sync Database"
          >
            <Upload size={16} /> Import
          </button>
          <button 
            onClick={() => setIsAddingEmployee(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-800 shadow-md transition-all active:scale-95"
          >
            <Plus size={18} /> Add Employee
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, role, or department..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-900/30 transition-all shadow-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-900 text-white shadow-md' : 'text-gray-400 hover:text-blue-900'}`}
            title="List View"
          >
            <LayoutList size={20} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-900 text-white shadow-md' : 'text-gray-400 hover:text-blue-900'}`}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('compact')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'compact' ? 'bg-blue-900 text-white shadow-md' : 'text-gray-400 hover:text-blue-900'}`}
            title="Compact View"
          >
            <Rows3 size={20} />
          </button>
        </div>

        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 shadow-sm font-bold text-xs uppercase tracking-widest">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900 accent-blue-900 cursor-pointer"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredEmployees.length}
                      ref={el => { if (el) el.indeterminate = selectedIds.length > 0 && selectedIds.length < filteredEmployees.length; }}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role & Dept</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tasks</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    className={`hover:bg-blue-50/30 transition-colors group cursor-pointer ${selectedIds.includes(emp.id) ? 'bg-blue-50/50' : ''}`}
                    onClick={() => setViewingEmployee(emp)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900 accent-blue-900 cursor-pointer"
                        checked={selectedIds.includes(emp.id)}
                        onChange={() => toggleSelect(emp.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-sm" />
                        <div>
                          <p className="text-sm font-bold text-blue-900">{emp.name}</p>
                          <p className="text-[11px] text-gray-400 font-medium">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-700">{emp.role}</p>
                      <p className="text-[11px] text-blue-900/50 font-bold uppercase tracking-tight">{emp.department}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all" 
                            style={{ width: `${emp.tasks?.length ? (emp.tasks.filter(t => t.status === 'Completed').length / emp.tasks.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {emp.tasks?.filter(t => t.status === 'Completed').length || 0}/{emp.tasks?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <ActionMenu emp={emp} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {filteredEmployees.map((emp) => (
            <div 
              key={emp.id}
              className={`bg-white rounded-[2rem] p-6 border transition-all hover:shadow-xl hover:-translate-y-1 relative group cursor-pointer ${
                selectedIds.includes(emp.id) ? 'border-blue-900 ring-2 ring-blue-900/10' : 'border-gray-100'
              }`}
              onClick={() => setViewingEmployee(emp)}
            >
              <div className="absolute top-4 right-4 z-10">
                <ActionMenu emp={emp} />
              </div>
              
              <div className="absolute top-6 left-6" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900 accent-blue-900 cursor-pointer"
                  checked={selectedIds.includes(emp.id)}
                  onChange={() => toggleSelect(emp.id)}
                />
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img 
                    src={emp.avatar} 
                    alt={emp.name} 
                    className="w-24 h-24 rounded-[2rem] object-cover shadow-2xl shadow-blue-900/10 border-4 border-white" 
                  />
                  <div className="absolute -bottom-2 -right-2">
                    <StatusBadge status={emp.status} />
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-blue-900">{emp.name}</h3>
                <p className="text-xs font-bold text-blue-900/50 uppercase tracking-widest mt-1">{emp.role}</p>
                <div className="mt-3 flex items-center gap-1.5 text-gray-400">
                  <Building2 size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{emp.department}</span>
                </div>

                <div className="w-full mt-6 pt-6 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assignments</span>
                    <span className="text-[10px] font-bold text-blue-900">
                      {Math.round(emp.tasks?.length ? (emp.tasks.filter(t => t.status === 'Completed').length / emp.tasks.length) * 100 : 0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-900 transition-all duration-500" 
                      style={{ width: `${emp.tasks?.length ? (emp.tasks.filter(t => t.status === 'Completed').length / emp.tasks.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'compact' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 w-8">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-gray-300 text-blue-900 focus:ring-blue-900 accent-blue-900 cursor-pointer"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredEmployees.length}
                      ref={el => { if (el) el.indeterminate = selectedIds.length > 0 && selectedIds.length < filteredEmployees.length; }}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                  <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
                  <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    className={`hover:bg-blue-50/20 transition-colors group cursor-pointer ${selectedIds.includes(emp.id) ? 'bg-blue-50/30' : ''}`}
                    onClick={() => setViewingEmployee(emp)}
                  >
                    <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-900 focus:ring-blue-900 accent-blue-900 cursor-pointer"
                        checked={selectedIds.includes(emp.id)}
                        onChange={() => toggleSelect(emp.id)}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img src={emp.avatar} alt="" className="w-6 h-6 rounded-lg object-cover border border-gray-100 shadow-sm" />
                        <span className="text-xs font-bold text-blue-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-xs text-gray-600 font-medium">{emp.role}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-[10px] text-blue-900/40 font-black uppercase tracking-tight">{emp.department}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <ActionMenu emp={emp} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Slide-over */}
      {isAddingEmployee && (
        <div className="fixed inset-0 z-[70] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddingEmployee(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-900 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">New Personnel</h2>
                  <p className="text-[10px] text-blue-200 uppercase font-bold tracking-widest">Srinidhi Associates Registry</p>
                </div>
              </div>
              <button onClick={() => setIsAddingEmployee(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                  <div className="relative">
                    <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      autoFocus
                      type="text" 
                      required
                      placeholder="e.g. Robert Downey"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-900/20 transition-all font-medium"
                      value={newEmp.name}
                      onChange={e => setNewEmp({...newEmp, name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Professional Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      type="email" 
                      required
                      placeholder="name@srinidhi.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-900/20 transition-all font-medium"
                      value={newEmp.email}
                      onChange={e => setNewEmp({...newEmp, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Position</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Lead Analyst"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-900/20 transition-all font-medium text-sm"
                        value={newEmp.role}
                        onChange={e => setNewEmp({...newEmp, role: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Department</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                      <select 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none appearance-none"
                        value={newEmp.department}
                        onChange={e => setNewEmp({...newEmp, department: e.target.value})}
                      >
                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-900 text-white rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10 active:scale-95">Register Employee</button>
            </form>
          </div>
        </div>
      )}

      {/* Employee Detail Slide-over */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => { setViewingEmployee(null); setReassigningTaskId(null); }} />
          <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-900">Employee Details</h2>
              <button onClick={() => { setViewingEmployee(null); setReassigningTaskId(null); }} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar space-y-8">
              <div className="flex items-center gap-6">
                <img src={viewingEmployee.avatar} className="w-24 h-24 rounded-3xl object-cover shadow-lg border-2 border-white" alt="" />
                <div>
                  <h3 className="text-2xl font-bold text-blue-900">{viewingEmployee.name}</h3>
                  <p className="text-gray-500 font-medium">{viewingEmployee.role}</p>
                  <p className="text-xs text-blue-900/40 font-bold uppercase tracking-widest mt-1">{viewingEmployee.department}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <ClipboardList size={16} /> Tasks Management
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-900 rounded-full uppercase">
                    {(viewingEmployee.tasks || []).length} Total
                  </span>
                </div>

                <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Task Title</label>
                    <input 
                      type="text" 
                      placeholder="What needs to be done?"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm outline-none font-medium shadow-sm"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Due Date</label>
                      <input 
                        type="date"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-2xl text-[11px] font-bold text-gray-600 outline-none shadow-sm"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Priority</label>
                      <select 
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-2xl text-[11px] font-bold text-gray-600 outline-none appearance-none shadow-sm"
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={addTask}
                    className="w-full py-2 bg-blue-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-md active:scale-[0.98]"
                  >
                    Assign Task
                  </button>
                </div>

                <div className="space-y-3">
                  {(viewingEmployee.tasks || []).length === 0 ? (
                    <div className="text-center py-12 text-gray-400 italic text-sm">No tasks assigned.</div>
                  ) : (
                    (viewingEmployee.tasks || []).sort((a,b) => a.status === 'Completed' ? 1 : -1).map(task => (
                      <div 
                        key={task.id} 
                        className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                          task.status === 'Completed' ? 'bg-gray-50/50 border-gray-100 opacity-60' : 'bg-white border-gray-100 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => toggleTaskStatus(task.id)}
                              className="p-1 rounded-lg transition-colors text-gray-300 hover:text-blue-900"
                            >
                              {task.status === 'Completed' ? <CheckCircle size={24} className="text-green-600" /> : 
                              task.status === 'In Progress' ? <Clock size={24} className="text-blue-600 animate-pulse" /> : 
                              <div className="w-6 h-6 border-2 border-gray-200 rounded-full" />}
                            </button>
                            <div>
                              <p className={`text-sm font-bold ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-blue-900'}`}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                                  task.priority === 'High' ? 'bg-red-50 text-red-600' :
                                  task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {task.priority}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Due {task.dueDate}</span>
                              </div>
                            </div>
                          </div>
                          
                          {task.status !== 'Completed' && (
                            <button 
                              onClick={() => setReassigningTaskId(reassigningTaskId === task.id ? null : task.id)}
                              className={`p-2 rounded-xl transition-all border ${reassigningTaskId === task.id ? 'bg-blue-900 text-white border-blue-900' : 'text-gray-400 hover:text-blue-900 hover:bg-blue-50 border-transparent'}`}
                              title="Reassign Task"
                            >
                              <ArrowRightLeft size={16} />
                            </button>
                          )}
                        </div>

                        {reassigningTaskId === task.id && (
                          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 animate-in fade-in zoom-in-95 duration-200">
                            <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-1">
                              <UserRoundCheck size={12} /> Reassign to:
                            </p>
                            <div className="max-h-32 overflow-y-auto no-scrollbar space-y-1">
                              {employees
                                .filter(e => e.id !== viewingEmployee.id && e.status !== 'Inactive')
                                .map(targetEmp => (
                                  <button
                                    key={targetEmp.id}
                                    onClick={() => handleReassign(task.id, targetEmp.id)}
                                    className="w-full text-left p-2 rounded-lg bg-white border border-gray-100 hover:border-blue-300 hover:bg-blue-100/50 transition-all flex items-center gap-2"
                                  >
                                    <img src={targetEmp.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                                    <div className="truncate">
                                      <p className="text-xs font-bold text-blue-900 truncate">{targetEmp.name}</p>
                                      <p className="text-[9px] text-gray-400 truncate">{targetEmp.department}</p>
                                    </div>
                                  </button>
                                ))}
                            </div>
                            <button 
                              onClick={() => setReassigningTaskId(null)}
                              className="w-full mt-2 py-1 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
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

export default Employees;
