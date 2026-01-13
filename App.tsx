
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Recruitment from './pages/Recruitment';
import Performance from './pages/Performance';
import Documents from './pages/Documents';
import Attendance from './pages/Attendance';
import Security from './pages/Security';
import LeaveManagement from './pages/LeaveManagement';
import ExitManagement from './pages/ExitManagement';
import Login from './pages/Login';
import MyTasks from './pages/MyTasks';
import { Bell, Search, LogOut, X, Clock, ShieldAlert, Sparkles, PartyPopper, CheckCircle2 } from 'lucide-react';
import Logo from './components/Logo';
import { User, Employee, Notification, Task, LeaveRequest, ResignationRequest } from './types';
import { MOCK_EMPLOYEES } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [resignationRequests, setResignationRequests] = useState<ResignationRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const currentEmployee = employees.find(e => e.id === user?.id);

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

  const renderContent = () => {
    if (!user) return null;
    
    // If user must change password, restrict access to other pages
    if (currentEmployee?.mustChangePassword && activeTab !== 'security') {
      return <Security user={user} employees={employees} setEmployees={setEmployees} addNotification={addNotification} />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tasks': return currentEmployee ? <MyTasks employee={currentEmployee} onUpdateTask={handleUpdateTaskStatus} /> : <Dashboard />;
      case 'profiles': return user.role === 'HR' ? <Employees employees={employees} setEmployees={setEmployees} addNotification={addNotification} /> : <Dashboard />;
      case 'recruitment': return user.role === 'HR' ? <Recruitment /> : <Dashboard />;
      case 'performance': return <Performance />;
      case 'attendance': return <Attendance user={user} />;
      case 'leave': return (
        <LeaveManagement 
          user={user} 
          leaveRequests={leaveRequests} 
          setLeaveRequests={setLeaveRequests}
          addNotification={addNotification}
          employees={employees}
        />
      );
      case 'exit': return (
        <ExitManagement
          user={user}
          resignationRequests={resignationRequests}
          setResignationRequests={setResignationRequests}
          addNotification={addNotification}
          employees={employees}
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
          
          <div className="hidden md:flex items-center bg-white rounded-xl border border-gray-200 px-4 py-2 w-96 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search className="text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Quick search records..." 
              className="bg-transparent border-none outline-none text-sm ml-2 w-full font-medium"
              disabled={!!currentEmployee?.mustChangePassword}
            />
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
                  <div className="p-3 text-center bg-gray-50">
                    <button className="text-[10px] font-bold uppercase tracking-widest text-blue-900 hover:underline">View All Notifications</button>
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
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
