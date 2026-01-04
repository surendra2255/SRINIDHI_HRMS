
import React, { useState } from 'react';
import { Briefcase, Wand2, Plus, Loader2 } from 'lucide-react';
import { generateJobDescription } from '../services/geminiService';
import { DEPARTMENTS } from '../constants';

const Recruitment: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [generatedJD, setGeneratedJD] = useState('');

  const handleGenerate = async () => {
    if (!jobTitle) return;
    setIsGenerating(true);
    try {
      const jd = await generateJobDescription(jobTitle, dept);
      setGeneratedJD(jd);
    } catch (error) {
      console.error(error);
      alert("Failed to generate JD. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recruitment Hub</h1>
          <p className="text-gray-500">Manage hiring for Srinidhi Associates.</p>
        </div>
        <button className="px-4 py-2 bg-blue-900 text-white rounded-xl font-medium hover:bg-blue-800 flex items-center gap-2 transition-all active:scale-95 shadow-sm">
          <Plus size={18} /> New Posting
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-900">
              <Wand2 size={20} />
              JD Generator
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                  placeholder="e.g. Senior Associate"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                >
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !jobTitle}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isGenerating ? 'bg-gray-100 text-gray-400' : 'bg-blue-900 text-white hover:bg-blue-800 active:scale-95'
                }`}
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : 'Generate with Gemini'}
              </button>
            </div>
          </div>

          <div className="bg-blue-900 p-6 rounded-2xl text-white shadow-lg">
            <h3 className="font-bold mb-2">Hiring Quality</h3>
            <p className="text-blue-100 text-sm">
              AI-generated descriptions are tailored to Srinidhi Associates' standards of excellence.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-900">Draft Job Description</h2>
            <button 
              className="text-sm text-blue-900 font-semibold hover:underline"
              onClick={() => { navigator.clipboard.writeText(generatedJD); alert("Copied!"); }}
              disabled={!generatedJD}
            >
              Copy Text
            </button>
          </div>
          
          <div className="flex-1 bg-gray-50 rounded-xl p-6 overflow-y-auto max-h-[600px] border border-gray-100">
            {generatedJD ? (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
                {generatedJD}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-4 bg-white rounded-full shadow-inner">
                  <Briefcase size={48} className="text-gray-200" />
                </div>
                <p className="text-gray-400 font-medium italic">
                  Generate a professional draft for your next opening.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recruitment;
