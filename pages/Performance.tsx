
import React, { useState } from 'react';
import { Star, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { summarizePerformanceReview } from '../services/geminiService';
import { MOCK_EMPLOYEES } from '../constants';

const Performance: React.FC = () => {
  const [selectedEmp, setSelectedEmp] = useState(MOCK_EMPLOYEES[0]);
  const [rawNotes, setRawNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!rawNotes) return;
    setIsSummarizing(true);
    try {
      const result = await summarizePerformanceReview(rawNotes);
      setSummary(result);
    } catch (err) {
      console.error(err);
      alert("Error summarizing review.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold">Performance Reviews</h1>
        <p className="text-gray-500">Track professional growth at Srinidhi Associates.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-bold text-gray-700 px-2 uppercase text-xs tracking-widest">Team Members</h2>
          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-2 no-scrollbar">
            {MOCK_EMPLOYEES.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmp(emp)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                  selectedEmp.id === emp.id 
                    ? 'bg-white border-blue-200 shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-gray-100 text-gray-600'
                }`}
              >
                <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full" />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{emp.name}</p>
                  <p className="text-xs opacity-70 truncate">{emp.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img src={selectedEmp.avatar} alt="" className="w-20 h-20 rounded-2xl shadow-md" />
              <div className="flex-1 space-y-1">
                <h3 className="text-xl font-bold text-blue-900">{selectedEmp.name}</h3>
                <p className="text-gray-500">{selectedEmp.role} &bull; {selectedEmp.department}</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-blue-900">
                    {[1,2,3,4].map(i => <Star key={i} size={16} fill="currentColor" />)}
                    <Star size={16} className="text-gray-200" fill="currentColor" />
                  </div>
                  <span className="text-sm text-gray-400 font-medium">Last Review: 6 months ago</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Internal Feedback Notes</label>
                <textarea 
                  className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all text-sm leading-relaxed"
                  placeholder="Paste rough notes or observations here..."
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleSummarize}
                  disabled={isSummarizing || !rawNotes}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all active:scale-95 disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {isSummarizing ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
                  Summarize Performance
                </button>
              </div>

              {summary && (
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-2 text-blue-900 font-bold mb-3 uppercase tracking-wider text-xs">
                    <CheckCircle size={14} /> AI-Generated Summary
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {summary}
                  </p>
                  <div className="mt-6 flex gap-3">
                    <button className="px-4 py-2 bg-white border border-blue-200 text-blue-900 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                      Save to Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
