
import React, { useState, useRef } from 'react';
import { PenTool, X, Check, RotateCcw } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signature: string) => void;
  title: string;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const [signature, setSignature] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleConfirm = () => {
    if (!signature.trim()) return;
    onConfirm(signature);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-900 text-white rounded-2xl shadow-lg shadow-blue-900/20">
              <PenTool size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight">Digital Signature</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type your full name to sign</label>
            <input 
              type="text" 
              placeholder="Enter your full name..." 
              className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white focus:border-blue-900/20 transition-all font-bold text-lg text-blue-900 italic serif"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              autoFocus
            />
            <p className="text-[9px] text-gray-400 font-medium italic leading-relaxed">
              By typing your name above, you are creating a legally binding digital signature and confirming your approval of this document.
            </p>
          </div>

          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-900 shrink-0">
              <Check size={20} />
            </div>
            <div>
              <p className="text-[10px] text-blue-900 font-black uppercase tracking-widest mb-1">Authenticated Sign-off</p>
              <p className="text-[9px] text-blue-700/70 font-bold uppercase tracking-tight leading-relaxed">
                This signature will be cryptographically linked to your user ID and timestamped in the system audit log.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!signature.trim()}
              className="flex-1 py-5 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50"
            >
              Confirm Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
