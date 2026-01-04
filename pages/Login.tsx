
import React, { useState } from 'react';
import { User as UserIcon, Lock, AlertCircle, Eye, EyeOff, Snowflake, Ban } from 'lucide-react';
import Logo from '../components/Logo';
import { UserRole, User } from '../types';
import { MOCK_EMPLOYEES } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // Search for employee in mock database
      const employee = MOCK_EMPLOYEES.find(emp => emp.id === userId.trim());
      
      if (employee && password === 'password123') {
        // Check account status
        if (employee.status === 'Frozen') {
          setError('ACCESS DENIED: Your account is temporarily frozen. Please contact the HR department.');
          setIsLoading(false);
          return;
        }
        
        if (employee.status === 'Inactive') {
          setError('ACCESS DENIED: This account has been deactivated and is no longer valid.');
          setIsLoading(false);
          return;
        }

        const userRole: UserRole = employee.role.includes('HR') ? 'HR' : 'Employee';
        const user: User = {
          id: employee.id,
          name: employee.name,
          role: userRole,
          email: employee.email,
          avatar: employee.avatar
        };
        onLogin(user);
      } else {
        setError('Invalid Personnel ID or Password. Please try again.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#1e3a8a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-800/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-900/40 rounded-full blur-3xl"></div>

      <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 max-w-md w-full text-center relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex justify-center mb-6">
          <Logo className="w-20 h-20 shadow-2xl shadow-blue-900/20" />
        </div>
        
        <div className="space-y-1 mb-10">
          <h1 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-tighter">Srinidhi Associates</h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Personnel Gateway</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
            {error.includes('frozen') ? <Snowflake size={18} className="flex-shrink-0" /> : <Ban size={18} className="flex-shrink-0" />}
            <p className="text-xs font-bold text-left leading-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Personnel ID</label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors" size={18} />
              <input 
                type="text" 
                required
                autoComplete="username"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-900/20 transition-all font-bold text-sm text-blue-900 placeholder:text-gray-300"
                placeholder="e.g. emp-alice"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Access Token</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                autoComplete="current-password"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-900/20 transition-all font-bold text-sm text-blue-900 placeholder:text-gray-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-900 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-[#1e3a8a] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Initialize Access 
                <div className="p-1 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <UserIcon size={14} />
                </div>
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-50">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
            Security Notice: Unauthorized access is strictly prohibited. <br/>
            Contact IT Support for credential recovery.
          </p>
          
          <div className="mt-4 flex flex-col gap-1 items-center">
            <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">Demo Credentials</p>
            <div className="flex flex-wrap justify-center gap-2">
              <code className="text-[9px] text-blue-300 bg-blue-50 px-2 py-1 rounded">emp-diana / password123</code>
              <code className="text-[9px] text-blue-300 bg-blue-50 px-2 py-1 rounded">emp-alice / password123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
