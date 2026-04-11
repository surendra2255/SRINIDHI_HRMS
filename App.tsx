
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Recruitment from './pages/Recruitment';
import Appraisals from './pages/Appraisals';
import Documents from './pages/Documents';
import Attendance from './pages/Attendance';
import Security from './pages/Security';
import LeaveManagement from './pages/LeaveManagement';
import ExitManagement from './pages/ExitManagement';
import Assets from './pages/Assets';
import RecoveryCRM from './pages/RecoveryCRM';
import ITSupport from './pages/ITSupport';
import FieldOps from './pages/FieldOps';
import Calendar from './pages/Calendar';
import Expenses from './pages/Expenses';
import AuditLog from './pages/AuditLog';
import Login from './pages/Login';
import MyTasks from './pages/MyTasks';
import DailyAgenda from './pages/DailyAgenda';
import Training from './pages/Training';
import Messages from './pages/Messages';
import { Bell, Search, LogOut, X, Clock, ShieldAlert, Sparkles, PartyPopper, CheckCircle2, Megaphone, MessageSquare, Command } from 'lucide-react';
import Logo from './components/Logo';
import CommandPalette from './components/CommandPalette';
import PageTransition from './components/PageTransition';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Employee, 
  Notification, 
  Task, 
  LeaveRequest, 
  ResignationRequest, 
  AuditLogEntry,
  BroadcastMessage,
  FollowUpReminder,
  InternalMessage,
  InventoryItem,
  TrainingModule,
  PerformanceReview
} from './types';
import { MOCK_EMPLOYEES } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [resignationRequests, setResignationRequests] = useState<ResignationRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([
    {
      id: 'b1',
      title: 'New Compliance Policy 2024',
      content: 'All recovery agents must complete the new RBI compliance training by end of this month.',
      authorId: 'emp-md',
      authorName: 'Srinidhi Rao',
      timestamp: '2024-05-15 09:00 AM',
      priority: 'High'
    }
  ]);
  const [reminders, setReminders] = useState<FollowUpReminder[]>([
    { id: 'r1', caseId: 'REC-001', customerName: 'John Doe', agentId: 'emp-alice', dueDate: '2024-05-20', type: 'Call', status: 'Pending' },
    { id: 'r2', caseId: 'REC-002', customerName: 'Jane Smith', agentId: 'emp-bob', dueDate: '2024-05-21', type: 'Visit', status: 'Pending' },
  ]);
  const [internalMessages, setInternalMessages] = useState<InternalMessage[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 'inv-1', assetId: 'ASSET-001', name: 'MacBook Pro M2', category: 'Computing', serialNumber: 'SN123456', status: 'Assigned', assignedTo: 'Alice Johnson', purchaseDate: '2023-01-15', condition: 'New' },
    { id: 'inv-2', assetId: 'ASSET-002', name: 'Dell Monitor 27"', category: 'Peripherals', serialNumber: 'SN789012', status: 'In Stock', purchaseDate: '2023-02-20', condition: 'Good' },
  ]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([
    {
      id: 'tr-1',
      title: 'RBI Recovery Guidelines 2024',
      description: 'Essential training on the latest RBI guidelines for debt recovery and customer interaction.',
      category: 'Compliance',
      duration: '45 mins',
      quiz: [
        { id: 'q1', question: 'What is the maximum time an agent can call a customer?', options: ['7 AM - 7 PM', '8 AM - 7 PM', '9 AM - 8 PM', '8 AM - 8 PM'], correctAnswer: 1 }
      ],
      completedBy: ['emp-alice']
    }
  ]);
  const [appraisals, setAppraisals] = useState<PerformanceReview[]>([]);

  const logAction = (module: string, action: string, details: string) => {
    if (!user) return;
    const newEntry: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      module,
      action,
      details,
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const currentEmployee = employees.find(e => e.id === user?.id);

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Enforcement logic: If password change is required, lock the user to the security tab
  useEffect(() => {
    if (currentEmployee?.mustChangePassword && activeTab !== 'security') {
      setActiveTab('security');
    }
  }, [currentEmployee?.mustChangePassword, activeTab]);

  // Handle welcome screen visibility
  useEffect(() => {
    if (user && currentEmployee && !currentEmployee.hasLoggedInBefore) {
      setShowWelcome(true);
    }
  }, [user, currentEmployee]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setShowNotifications(false);
    setShowWelcome(false);
  };

  const handleFinishWelcome = () => {
    if (user) {
      setEmployees(prev => prev.map(emp => 
        emp.id === user.id ? { ...emp, hasLoggedInBefore: true } : emp
      ));
    }
    setShowWelcome(false);
  };

  const addNotification = (userId: string, title: string, message: string) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const userNotifications = notifications.filter(n => n.userId === user?.id || (user?.role === 'HR'));
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleUpdateTaskStatus = (taskId: string, status: Task['status']) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === user?.id) {
        return {
          ...emp,
          tasks: (emp.tasks || []).map(t => t.id === taskId ? { ...t, status } : t)
        };
      }
      return emp;
    }));
  };

  const handleCompleteReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'Completed' } : r));
    logAction('Daily Agenda', 'Complete Task', `Marked follow-up task ${id} as completed`);
  };

  const renderContent = () => {
    if (!user) return null;
    
    // If user must change password, restrict access to other pages
    if (currentEmployee?.mustChangePassword && activeTab !== 'security') {
      return <Security user={user} employees={employees} setEmployees={setEmployees} addNotification={addNotification} />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'calendar': return <Calendar employees={employees} />;
      case 'expenses': return <Expenses user={user} addNotification={addNotification} logAction={logAction} />;
      case 'crm': return <RecoveryCRM user={user} addNotification={addNotification} logAction={logAction} />;
      case 'field-ops': return <FieldOps user={user} addNotification={addNotification} />;
      case 'it-support': return <ITSupport user={user} addNotification={addNotification} logAction={logAction} />;
      case 'tasks': 
        if (user.role === 'RecoveryAgent' || user.role === 'FieldOfficer') {
          return <DailyAgenda user={user} reminders={reminders.filter(r => r.agentId === user.id)} onComplete={handleCompleteReminder} />;
        }
        return currentEmployee ? <MyTasks employee={currentEmployee} onUpdateTask={handleUpdateTaskStatus} /> : <Dashboard />;
      case 'profiles': return user.role === 'HR' ? <Employees employees={employees} setEmployees={setEmployees} addNotification={addNotification} logAction={logAction} /> : <Dashboard />;
      case 'recruitment': return user.role === 'HR' ? <Recruitment /> : <Dashboard />;
      case 'performance': return <Appraisals user={user} appraisals={appraisals} employees={employees} logAction={logAction} />;
      case 'training': return <Training user={user} modules={trainingModules} logAction={logAction} />;
      case 'messages': return <Messages user={user} messages={internalMessages} setMessages={setInternalMessages} employees={employees} />;
      case 'attendance': return <Attendance user={user} />;
      case 'audit-log': return (user.role === 'HR' || user.role === 'ITAdmin') ? <AuditLog logs={auditLogs} /> : <Dashboard />;
      case 'leave': return (
        <LeaveManagement 
          user={user} 
          leaveRequests={leaveRequests} 
          setLeaveRequests={setLeaveRequests}
          addNotification={addNotification}
          employees={employees}
        />
      );
      case 'inventory': return (user.role === 'HR' || user.role === 'ITAdmin') ? (
        <Assets 
          user={user}
          inventory={inventory}
          setInventory={setInventory}
          logAction={logAction}
        />
      ) : <Dashboard />;
      case 'exit': return (
        <ExitManagement
          user={user}
          resignationRequests={resignationRequests}
          setResignationRequests={setResignationRequests}
          addNotification={addNotification}
          employees={employees}
          setEmployees={setEmployees}
        />
      );
      case 'documents': return (
        <Documents 
          user={user} 
          allEmployees={employees} 
          setEmployees={setEmployees} 
          addNotification={addNotification}
        />
      );
      case 'security': return <Security user={user} employees={employees} setEmployees={setEmployees} addNotification={addNotification} />;
      default: return <Dashboard />;
    }
  };

  // If user is not logged in, show the Login page
  if (!user) {
    return <Login onLogin={handleLogin} employees={employees} setEmployees={setEmployees} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Welcome Screen Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#1e3a8a]/95 backdrop-blur-xl animate-in fade-in duration-700">
          <div className="max-w-2xl w-full bg-white rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full -ml-32 -mb-32 opacity-50 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-900 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/20 rotate-3 transition-transform hover:rotate-0">
                <Logo className="w-16 h-16" />
              </div>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-center justify-center gap-3 text-blue-600">
                  <Sparkles size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Official Onboarding</span>
                  <Sparkles size={20} />
                </div>
                <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter serif leading-tight">
                  Welcome to the <br/> Srinidhi Family
                </h1>
                <p className="text-gray-500 font-medium text-lg max-w-md mx-auto">
                  Hello, <span className="text-blue-900 font-bold">{user.name}</span>. We're thrilled to have you join our world-class team of professionals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-10">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-900 mb-3">
                    <CheckCircle2 size={20} />
                  </div>
                  <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">Onboarding Active</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Email dispatched to HR Desk</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple-600 mb-3">
                    <PartyPopper size={20} />
                  </div>
                  <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">Growth Ready</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Your digital workspace is primed</p>
                </div>
              </div>

              <button 
                onClick={handleFinishWelcome}
                className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95 group flex items-center justify-center gap-3"
              >
                Initialize Workspace
                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
              </button>
              
              <p className="mt-6 text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                Securely synchronized with saisurendra@srinidhiassociates.co.in
              </p>
            </div>
          </div>
        </div>
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        disabled={!!currentEmployee?.mustChangePassword}
      />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {currentEmployee?.mustChangePassword && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4 text-orange-800">
              <ShieldAlert size={20} className="shrink-0" />
              <p className="text-sm font-bold uppercase tracking-tight">Security Action Required: Mandatory access token update mandated by HR administration.</p>
            </div>
            <div className="px-3 py-1 bg-orange-100 text-orange-900 text-[10px] font-black rounded-lg uppercase">Restricted Mode</div>
          </div>
        )}

        <nav className="flex items-center justify-between mb-8 sticky top-0 bg-gray-50/80 backdrop-blur-md z-10 py-4">
          <div className="md:hidden flex items-center gap-2">
             <Logo className="w-8 h-8" />
             <span className="font-bold text-sm tracking-tight text-[#1e3a8a] uppercase">Srinidhi</span>
          </div>
          
          <div 
            onClick={() => !currentEmployee?.mustChangePassword && setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center bg-white rounded-xl border border-gray-200 px-4 py-2 w-96 shadow-sm hover:border-blue-500/50 cursor-pointer transition-all group"
          >
            <Search className="text-gray-400 group-hover:text-blue-900" size={18} />
            <div className="text-gray-400 text-sm ml-2 w-full font-medium flex items-center justify-between">
              <span>Quick search records...</span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <Command size={8} /> K
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markAllAsRead();
                }}
                disabled={!!currentEmployee?.mustChangePassword}
                className="p-2 text-gray-400 hover:bg-white hover:text-blue-900 rounded-xl transition-all relative disabled:opacity-30"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-50"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-900 text-white">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto no-scrollbar">
                    {userNotifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm italic">No recent notifications.</div>
                    ) : (
                      userNotifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <p className="text-sm font-bold text-blue-900">{notif.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2 uppercase font-bold">
                            <Clock size={10} /> {notif.timestamp}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 text-center bg-gray-50 flex items-center justify-center gap-4">
                    <button className="text-[10px] font-black uppercase tracking-widest text-blue-900 hover:underline">View All</button>
                    <button 
                      onClick={clearAllNotifications}
                      className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"><LogOut size={20} /></button>
            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold group-hover:text-blue-900 transition-colors uppercase tracking-tight">{user.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white border-2 border-white shadow-md overflow-hidden">
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <PageTransition key={activeTab}>
              {renderContent()}
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(path) => {
          setActiveTab(path);
          setIsCommandPaletteOpen(false);
        }}
      />
    </div>
  );
};

export default App;
