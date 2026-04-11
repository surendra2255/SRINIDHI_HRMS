
import React, { useState } from 'react';
import { 
  GraduationCap, 
  Play, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight,
  BookOpen,
  Award,
  Video,
  FileQuestion
} from 'lucide-react';
import { TrainingModule, User } from '../types';

interface TrainingProps {
  user: User;
  modules: TrainingModule[];
  logAction: (module: string, action: string, details: string) => void;
}

const Training: React.FC<TrainingProps> = ({ user, modules, logAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);

  const filteredModules = modules.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const completedCount = modules.filter(m => m.completedBy.includes(user.id)).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter serif">Training Portal</h1>
          <p className="text-gray-500 font-medium">Enhance your skills with our curated learning modules.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl">
            <Award size={18} />
            <span className="text-xs font-black uppercase tracking-widest">{completedCount} Modules Completed</span>
          </div>
        </div>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-blue-900 text-white p-8 rounded-[3rem] shadow-2xl shadow-blue-900/20">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-2">Learning Progress</p>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-black">{Math.round((completedCount / modules.length) * 100)}%</span>
              <span className="text-xl font-bold text-blue-300 mb-1">Complete</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000" 
                style={{ width: `${(completedCount / modules.length) * 100}%` }}
              ></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><BookOpen size={14} /> Total Modules</span>
                <span>{modules.length}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><Clock size={14} /> Hours Learned</span>
                <span>12.5 hrs</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Categories</p>
            <div className="space-y-2">
              {['All', 'Compliance', 'Technical', 'Soft Skills', 'Onboarding'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    categoryFilter === cat ? 'bg-blue-50 text-blue-900' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                  {categoryFilter === cat && <ChevronRight size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for courses, topics or skills..." 
              className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] text-sm font-medium shadow-sm focus:ring-4 focus:ring-blue-900/5 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredModules.map((module) => (
              <div key={module.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all flex flex-col">
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${module.id}/600/400`} 
                    alt={module.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-6">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                      {module.category}
                    </span>
                  </div>
                  {module.completedBy.includes(user.id) && (
                    <div className="absolute top-4 right-4 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight mb-2">{module.title}</h3>
                  <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6">{module.description}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock size={14} /> {module.duration}</span>
                      <span className="flex items-center gap-1"><FileQuestion size={14} /> {module.quiz.length} Qs</span>
                    </div>
                    <button 
                      onClick={() => setSelectedModule(module)}
                      className="flex items-center gap-2 text-[10px] font-black text-blue-900 uppercase tracking-widest hover:gap-3 transition-all"
                    >
                      {module.completedBy.includes(user.id) ? 'Review' : 'Start Course'} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Detail Modal (Simplified for now) */}
      {selectedModule && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="bg-gray-900 aspect-video lg:aspect-auto flex items-center justify-center relative">
                <Video size={64} className="text-white/20" />
                <button className="absolute inset-0 flex items-center justify-center group">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-2xl group-hover:scale-110 transition-transform">
                    <Play size={32} fill="currentColor" />
                  </div>
                </button>
              </div>
              <div className="p-12 space-y-8">
                <div className="flex items-center justify-between">
                  <span className="px-4 py-1 bg-blue-50 text-blue-900 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {selectedModule.category}
                  </span>
                  <button onClick={() => setSelectedModule(null)} className="text-gray-400 hover:text-gray-600">
                    <CheckCircle2 size={24} />
                  </button>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-blue-900 uppercase tracking-tight mb-4">{selectedModule.title}</h2>
                  <p className="text-gray-500 font-medium leading-relaxed">{selectedModule.description}</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Content</h4>
                  <div className="space-y-2">
                    {[
                      'Introduction to Banking Norms',
                      'Customer Psychology & Empathy',
                      'Legal Framework & Compliance',
                      'Final Assessment (Quiz)'
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-blue-900 shadow-sm">{i+1}</span>
                        <span className="text-sm font-bold text-gray-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20">
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;
