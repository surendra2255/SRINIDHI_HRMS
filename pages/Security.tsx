
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
  X
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
      setMessage({ type: 'error', text: 'The current access token you provided is incorrect.' });
      return false;
    }

    if (newPass !== confirmPass) {
      setMessage({ type: 'error', text: 'The new passwords do not match.' });
      return false;
    }

    if (newPass.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
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

    // Simulate update
    setTimeout(() => {
      setEmployees(prev => prev.map(emp => 
        emp.id === user.id ? { ...emp, password: newPass } : emp
      ));
      
      setIsUpdating(false);
      setMessage({ type: 'success', text: `Credential successfully ${isRecoveryMode ? 'recovered' : 'updated'}. Please use your new token for the next session.` });
      
      // Reset everything
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

    const matchesId = verifyId.trim() === currentEmployee.employeeId || verifyId.trim() === currentEmployee.id;
    const matchesEmail = verifyEmail.trim().toLowerCase() === currentEmployee.email.toLowerCase();

    if (matchesId && matchesEmail) {
      setRecoveryStep('reset');
    } else {
      setMessage({ type: 'error', text: 'Identity verification failed. Information does not match our records.' });
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-tighter">Personnel Security</h1>
          <p className="text-gray-500 font-medium">Manage your digital identity and access credentials at Srinidhi Associates.</p>
        </div>
        {isRecoveryMode && (
          <button 
            onClick={() => switchMode(false)}
            className="flex items-center gap-2 text-xs font-bold text-blue-900 hover:text-blue-700 uppercase tracking-widest transition-all mb-1"
          >
            <ArrowLeft size={14} /> Back to Standard Update
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className={`${isRecoveryMode ? 'bg-purple-900' : 'bg-blue-900'} p-6 rounded-[2rem] text-white shadow-xl transition-colors duration-500`}>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              {isRecoveryMode ? <LifeBuoy size={24} /> : <ShieldCheck size={24} />}
            </div>
            <h3 className="font-bold text-lg mb-2">{isRecoveryMode ? 'Identity Recovery' : 'Access Hardening'}</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {isRecoveryMode 
                ? 'Providing secondary verification details allows you to bypass your forgotten token and secure your account immediately.'
                : 'We recommend rotating your access token every 90 days to maintain organizational integrity and personal security.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Hygiene</h4>
            <div className="space-y-3">
              {[
                "Use 8+ characters",
                "Mix case and symbols",
                "Avoid common names",
                "Never share credentials"
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                  <div className={`w-1.5 h-1.5 rounded-full ${isRecoveryMode ? 'bg-purple-600' : 'bg-blue-900'}`} />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-8 text-gray-50 opacity-10 pointer-events-none transition-transform duration-700 ${isRecoveryMode ? 'translate-y-0 scale-110' : 'translate-y-4'}`}>
              {isRecoveryMode ? <ShieldAlert size={120} /> : <Lock size={120} />}
            </div>

            <h2 className={`text-xl font-bold mb-8 flex items-center gap-3 transition-colors duration-500 ${isRecoveryMode ? 'text-purple-900' : 'text-blue-900'}`}>
              {isRecoveryMode ? <LifeBuoy size={20} /> : <Key size={20} />} 
              {isRecoveryMode ? 'Token Recovery Protocol' : 'Credential Update'}
            </h2>

            {message && (
              <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                <p className="text-xs font-bold text-left">{message.text}</p>
              </div>
            )}

            {/* Recovery Mode: Step 1 - Verification */}
            {isRecoveryMode && recoveryStep === 'verify' && (
              <form onSubmit={handleVerifyIdentity} className="space-y-6 max-w-md animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Personnel ID / ID Code</label>
                  <div className="relative group">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-900 transition-colors" size={16} />
                    <input 
                      type="text" 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/5 focus:bg-white focus:border-purple-900/20 transition-all font-bold text-sm text-purple-900"
                      placeholder="e.g. SA-001"
                      value={verifyId}
                      onChange={(e) => setVerifyId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-900 transition-colors" size={16} />
                    <input 
                      type="email" 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/5 focus:bg-white focus:border-purple-900/20 transition-all font-bold text-sm text-purple-900"
                      placeholder="Enter registered email"
                      value={verifyEmail}
                      onChange={(e) => setVerifyEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-4 py-5 bg-purple-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:bg-purple-800 transition-all shadow-xl shadow-purple-900/20 active:scale-95"
                >
                  Verify Personnel Identity
                </button>
              </form>
            )}

            {/* Update Mode or Recovery Step 2 (Reset) */}
            {(!isRecoveryMode || (isRecoveryMode && recoveryStep === 'reset')) && (
              <form onSubmit={handleFormSubmit} className="space-y-6 max-w-md animate-in slide-in-from-left-4 duration-300">
                {!isRecoveryMode ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Access Token</label>
                      <button 
                        type="button" 
                        onClick={() => switchMode(true)}
                        className="text-[9px] font-bold text-blue-900 hover:underline uppercase tracking-widest"
                      >
                        Forgot Token?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-900 transition-colors" size={16} />
                      <input 
                        type={showPass.current ? "text" : "password"} 
                        required
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-900/20 transition-all font-bold text-sm text-blue-900"
                        placeholder="Enter current token"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                      />
                      <button type="button" onClick={() => toggleShow('current')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-900 transition-colors">
                        {showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-700">Identity Verified</p>
                      <p className="text-[10px] text-green-600 font-medium">Please set your new access credentials below.</p>
                    </div>
                  </div>
                )}

                <div className={`h-[1px] ${isRecoveryMode ? 'bg-purple-50' : 'bg-gray-50'} w-full my-8`} />

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Access Token</label>
                  <div className="relative group">
                    <ShieldCheck className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors ${isRecoveryMode ? 'group-focus-within:text-purple-900' : 'group-focus-within:text-blue-900'}`} size={16} />
                    <input 
                      type={showPass.new ? "text" : "password"} 
                      required
                      className={`w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 transition-all font-bold text-sm ${
                        isRecoveryMode 
                          ? 'focus:ring-purple-500/5 focus:border-purple-900/20 text-purple-900' 
                          : 'focus:ring-blue-500/5 focus:border-blue-900/20 text-blue-900'
                      }`}
                      placeholder="Set new token"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                    />
                    <button type="button" onClick={() => toggleShow('new')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-900 transition-colors">
                      {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Verify New Token</label>
                  <div className="relative group">
                    <ShieldCheck className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors ${isRecoveryMode ? 'group-focus-within:text-purple-900' : 'group-focus-within:text-blue-900'}`} size={16} />
                    <input 
                      type={showPass.confirm ? "text" : "password"} 
                      required
                      className={`w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 transition-all font-bold text-sm ${
                        isRecoveryMode 
                          ? 'focus:ring-purple-500/5 focus:border-purple-900/20 text-purple-900' 
                          : 'focus:ring-blue-500/5 focus:border-blue-900/20 text-blue-900'
                      }`}
                      placeholder="Repeat new token"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                    />
                    <button type="button" onClick={() => toggleShow('confirm')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-900 transition-colors">
                      {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUpdating || (!isRecoveryMode && !currentPass) || !newPass || !confirmPass}
                  className={`w-full mt-4 py-5 text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecoveryMode 
                      ? 'bg-purple-900 hover:bg-purple-800 shadow-purple-900/20' 
                      : 'bg-blue-900 hover:bg-blue-800 shadow-blue-900/20'
                  }`}
                >
                  {isUpdating 
                    ? (isRecoveryMode ? "Resetting Access..." : "Hardening Access...") 
                    : (isRecoveryMode ? "Finalize Token Recovery" : "Finalize Credential Change")}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowConfirmModal(false)}
          ></div>
          <div className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 ${isRecoveryMode ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'} rounded-full flex items-center justify-center mb-6`}>
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-xl font-bold text-blue-900 mb-2">Confirm Credential Change</h2>
              <p className="text-sm text-gray-500 mb-8">
                You are about to modify your organization access credentials. 
                {isRecoveryMode 
                  ? " This will override your forgotten token immediately." 
                  : " Please ensure you have documented your new token securely."}
              </p>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={finalizeUpdate}
                  className={`w-full py-4 text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                    isRecoveryMode 
                      ? 'bg-purple-900 hover:bg-purple-800 shadow-purple-900/20' 
                      : 'bg-blue-900 hover:bg-blue-800 shadow-blue-900/20'
                  }`}
                >
                  Proceed with Change
                </button>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                >
                  Cancel & Review
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
