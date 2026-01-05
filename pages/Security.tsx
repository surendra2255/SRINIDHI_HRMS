
import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Key, 
  LifeBuoy, 
  Fingerprint, 
  Mail, 
  ArrowLeft,
  ShieldAlert,
  X,
  UserCheck,
  Check,
  History,
  Monitor,
  Globe,
  MapPin
} from 'lucide-react';
import { User, Employee } from '../types';

interface SecurityProps {
  user: User;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const Security: React.FC<SecurityProps> = ({ user, employees, setEmployees }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Recovery State
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'verify' | 'reset'>('verify');
  const [verifyId, setVerifyId] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  
  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentEmployee = employees.find(e => e.id === user.id);

  const validateForm = () => {
    if (!currentEmployee) return false;

    if (!isRecoveryMode && currentPass !== currentEmployee.password) {
      setMessage({ type: 'error', text: 'Authentication Failure: The current access token you provided is incorrect.' });
      return false;
    }

    if (newPass !== confirmPass) {
      setMessage({ type: 'error', text: 'Validation Error: The new tokens do not match. Please re-verify.' });
      return false;
    }

    if (newPass.length < 8) {
      setMessage({ type: 'error', text: 'Security Requirement: New access tokens must be at least 8 characters long for organizational safety.' });
      return false;
    }

    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const finalizeUpdate = () => {
    setShowConfirmModal(false);
    setIsUpdating(true);

    // Simulate update delay
    setTimeout(() => {
      setEmployees(prev => prev.map(emp => 
        emp.id === user.id ? { ...emp, password: newPass } : emp
      ));
      
      setIsUpdating(false);
      setMessage({ type: 'success', text: `Access Token successfully ${isRecoveryMode ? 'recovered' : 'updated'}. Your account credentials have been hardened.` });
      
      // Reset form fields
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setIsRecoveryMode(false);
      setRecoveryStep('verify');
      setVerifyId('');
      setVerifyEmail('');
    }, 1200);
  };

  const handleVerifyIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentEmployee) return;

    const matchesId = verifyId.trim().toUpperCase() === currentEmployee.employeeId.toUpperCase() || verifyId.trim() === currentEmployee.id;
    const matchesEmail = verifyEmail.trim().toLowerCase() === currentEmployee.email.toLowerCase();

    if (matchesId && matchesEmail) {
      setRecoveryStep('reset');
    } else {
      setMessage({ type: 'error', text: 'Verification Failed: The provided identifiers do not match our personnel registry.' });
    }
  };

  const toggleShow = (field: keyof typeof showPass) => {
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const switchMode = (mode: boolean) => {
    setIsRecoveryMode(mode);
    setMessage(null);
    setRecoveryStep('verify');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  // Mock Login History Data
  const loginHistory = [
    { device: 'Chrome on MacOS', location: 'Bengaluru, IN', time: 'Just now', ip: '106.51.XX.XX', status: 'Success' },
    { device: 'Safari on iPhone', location: 'Bengaluru, IN', time: '2 hours ago', ip: '106.51.XX.XX', status: 'Success' },
    { device: 'Chrome on MacOS', location: 'Bengaluru, IN', time: 'Yesterday, 09:15 AM', ip: '106.51.XX.XX', status: 'Success' },
    { device: 'Unknown Browser', location: 'London, UK', time: '3 days ago', ip: '45.12.XX.XX', status: 'Blocked Attempt' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Security Center</h1>
          <p className="text-gray-500 font-medium tracking-tight">Manage your digital identity, access tokens, and security audit logs.</p>
        </div>
        {isRecoveryMode && (
          <button 
            onClick={() => switchMode(false)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-blue-900 hover:bg-gray-50 uppercase tracking-widest transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={14} /> Back to Standard Update
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Form Section */}
        <div className="xl:col-span-2 space-y-8">
          <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl shadow-blue-900/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 text-blue-900/5 pointer-events-none">
              {isRecoveryMode ? <ShieldAlert size={160} /> : <Lock size={160} />}
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className={`p-4 rounded-3xl ${isRecoveryMode ? 'bg-purple-100 text-purple-900' : 'bg-blue-900 text-white shadow-lg shadow-blue-900/20'}`}>
                  {isRecoveryMode ? <LifeBuoy size={28} /> : <Key size={28} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter leading-none">
                    {isRecoveryMode ? 'Access Token Recovery' : 'Account Protection'}
                  </h2>
                  <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                    {isRecoveryMode ? 'Personnel Identity Verification' : 'Update your organizational credentials'}
                  </p>
                </div>
              </div>

              {message && (
                <div className={`mb-8 p-5 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {message.type === 'success' ? <CheckCircle className="shrink-0" size={24} /> : <AlertTriangle className="shrink-0" size={24} />}
                  <p className="text-xs font-black uppercase tracking-tight leading-relaxed">{message.text}</p>
                </div>
              )}

              {/* Recovery Mode: Verification Form */}
              {isRecoveryMode && recoveryStep === 'verify' && (
                <form onSubmit={handleVerifyIdentity} className="space-y-6 max-w-lg animate-in slide-in-from-right-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Personnel Identifier (ID)</label>
                    <div className="relative group">
                      <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-900 transition-colors" size={20} />
                      <input 
                        type="text" 
                        required
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-transparent rounded-[1.5rem] outline-none focus:ring-4 focus:ring-purple-500/5 focus:bg-white focus:border-purple-900/20 transition-all font-bold text-sm text-purple-900"
                        placeholder="e.g. SA-001"
                        value={verifyId}
                        onChange={(e) => setVerifyId(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Corporate Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-900 transition-colors" size={20} />
                      <input 
                        type="email" 
                        required
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-transparent rounded-[1.5rem] outline-none focus:ring-4 focus:ring-purple-500/5 focus:bg-white focus:border-purple-900/20 transition-all font-bold text-sm text-purple-900"
                        placeholder="yourname@srinidhi.com"
                        value={verifyEmail}
                        onChange={(e) => setVerifyEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-5 bg-purple-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-purple-800 transition-all shadow-xl shadow-purple-900/20 active:scale-95"
                  >
                    Initiate Recovery Verification
                  </button>
                </form>
              )}

              {/* Standard Change or Recovery Reset Form */}
              {(!isRecoveryMode || (isRecoveryMode && recoveryStep === 'reset')) && (
                <form onSubmit={handleFormSubmit} className="space-y-6 max-w-lg animate-in slide-in-from-left-8">
                  {!isRecoveryMode ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between ml-1 mb-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Access Token</label>
                        <button 
                          type="button" 
                          onClick={() => switchMode(true)}
                          className="text-[9px] font-black text-blue-900 hover:underline uppercase tracking-[0.2em]"
                        >
                          Credential Recovery?
                        </button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-900 transition-colors" size={20} />
                        <input 
                          type={showPass.current ? "text" : "password"} 
                          required
                          className="w-full pl-14 pr-14 py-5 bg-gray-50 border border-transparent rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-900/20 transition-all font-bold text-sm text-blue-900"
                          placeholder="Current personnel token"
                          value={currentPass}
                          onChange={(e) => setCurrentPass(e.target.value)}
                        />
                        <button type="button" onClick={() => toggleShow('current')} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-900 transition-all">
                          {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-green-50 border border-green-100 rounded-[2rem] flex items-center gap-5 mb-8">
                      <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                        <UserCheck size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-green-800 uppercase tracking-tight">Personnel Verified</p>
                        <p className="text-[10px] text-green-700 font-bold opacity-60 uppercase tracking-widest">Security clearance granted for token override.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Access Token</label>
                      <div className="relative group">
                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-900 transition-colors" size={18} />
                        <input 
                          type={showPass.new ? "text" : "password"} 
                          required
                          className="w-full pl-12 pr-12 py-5 bg-gray-50 border border-transparent rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-900/20 transition-all font-bold text-sm text-blue-900"
                          placeholder="At least 8 chars"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                        />
                        <button type="button" onClick={() => toggleShow('new')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-900 transition-all">
                          {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmation</label>
                      <div className="relative group">
                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-900 transition-colors" size={18} />
                        <input 
                          type={showPass.confirm ? "text" : "password"} 
                          required
                          className="w-full pl-12 pr-12 py-5 bg-gray-50 border border-transparent rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-900/20 transition-all font-bold text-sm text-blue-900"
                          placeholder="Repeat new token"
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                        />
                        <button type="button" onClick={() => toggleShow('confirm')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-900 transition-all">
                          {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isUpdating || (!isRecoveryMode && !currentPass) || !newPass || !confirmPass}
                    className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Hardening Credentials...
                      </div>
                    ) : (
                      "Commit Credential Change"
                    )}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Security Best Practices */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-start gap-6">
              <div className="p-3 bg-blue-50 text-blue-900 rounded-2xl"><ShieldCheck size={24} /></div>
              <div>
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter">Two-Factor Auth</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">Multi-layered protection is currently enabled for all HR-privileged accounts.</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-start gap-6">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><AlertTriangle size={24} /></div>
              <div>
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter">Token Strength</h3>
                <p className="text-xs text-gray-400 font-medium mt-1">Avoid sequential numbers or birthday strings to ensure maximal personnel data safety.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Security Audit Log */}
        <div className="space-y-8">
          <section className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                <History size={18} className="text-blue-900/30" /> Recent Access Logs
              </h2>
              <span className="text-[9px] font-black text-blue-900/30 uppercase border px-2 py-1 rounded-lg">Live Registry</span>
            </div>
            
            <div className="space-y-4 flex-1">
              {loginHistory.map((log, i) => (
                <div key={i} className="p-5 rounded-[1.5rem] border border-gray-50 bg-gray-50/20 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${log.status.includes('Blocked') ? 'bg-red-50 text-red-600' : 'bg-white text-blue-900 shadow-sm border border-gray-100'}`}>
                        <Monitor size={14} />
                      </div>
                      <p className="text-xs font-bold text-blue-900">{log.device}</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      log.status.includes('Blocked') ? 'bg-red-500 text-white' : 'bg-green-100 text-green-700'
                    }`}>{log.status}</span>
                  </div>
                  <div className="space-y-1.5 pl-1">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                      <MapPin size={10} /> {log.location}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                      <Globe size={10} /> {log.ip}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-blue-900/30 font-black uppercase tracking-[0.2em] mt-2">
                      <History size={10} /> {log.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 hover:text-blue-900 transition-all active:scale-95">
              Export Security Audit
            </button>
          </section>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowConfirmModal(false)}
          ></div>
          <div className="relative bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-400">
            <div className="flex flex-col items-center text-center">
              <div className={`w-24 h-24 ${isRecoveryMode ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-900'} rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner`}>
                <ShieldAlert size={48} />
              </div>
              <h2 className="text-3xl font-black text-blue-900 mb-2 uppercase tracking-tighter leading-none">Security Alert</h2>
              <p className="text-sm text-gray-500 mb-10 font-bold uppercase tracking-widest leading-relaxed">
                You are about to modify your organization-wide access token.
                {isRecoveryMode 
                  ? " This will override existing credentials immediately." 
                  : " Please ensure you have documented this change for future logins."}
              </p>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={finalizeUpdate}
                  className={`w-full py-5 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                    isRecoveryMode 
                      ? 'bg-purple-900 hover:bg-purple-800 shadow-purple-900/20' 
                      : 'bg-blue-900 hover:bg-blue-800 shadow-blue-900/20'
                  }`}
                >
                  Confirm & Commit Change
                </button>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
