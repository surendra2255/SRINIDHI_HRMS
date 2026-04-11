
import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Smartphone, Loader2 } from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
  actionName: string;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, onClose, onVerify, actionName }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setError('');
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`2fa-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`2fa-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Mock verification delay
    setTimeout(() => {
      if (fullCode === '123456') { // Mock valid code
        setIsVerifying(false);
        onVerify();
        onClose();
      } else {
        setIsVerifying(false);
        setError('Invalid verification code. Try "123456" for demo.');
      }
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-900 text-white rounded-2xl shadow-lg shadow-blue-900/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight">Security Verification</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action: {actionName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-900 mx-auto mb-4">
              <Smartphone size={32} />
            </div>
            <h4 className="text-lg font-black text-blue-900 uppercase tracking-tight">Check your device</h4>
            <p className="text-sm text-gray-500 font-medium">We've sent a 6-digit verification code to your registered mobile number.</p>
          </div>

          <div className="flex justify-center gap-3">
            {code.map((digit, i) => (
              <input
                key={i}
                id={`2fa-input-${i}`}
                type="text"
                inputMode="numeric"
                className={`w-12 h-16 text-center text-2xl font-black text-blue-900 bg-gray-50 border-2 rounded-2xl outline-none transition-all ${
                  error ? 'border-red-100 focus:border-red-500' : 'border-transparent focus:border-blue-900 focus:bg-white'
                }`}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-xs font-bold text-red-500 uppercase tracking-widest animate-in shake duration-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isVerifying ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Verifying...
              </>
            ) : (
              'Verify & Continue'
            )}
          </button>

          <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Didn't receive code? <button type="button" className="text-blue-900 hover:underline">Resend</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorModal;
