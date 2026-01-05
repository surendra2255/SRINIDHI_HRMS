
import React, { useState } from 'react';
import { CheckCircle, Clock, Calendar, AlertCircle, CheckCircle2, CheckSquare, Square, X } from 'lucide-react';
import { Employee, Task } from '../types';

interface MyTasksProps {
  employee: Employee;
  onUpdateTask: (taskId: string, status: Task['status']) => void;
}

const MyTasks: React.FC<MyTasksProps> = ({ employee, onUpdateTask }) => {
  const [completingTaskIds, setCompletingTaskIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const tasks = employee.tasks || [];
  const incompleteTasks = tasks.filter(t => t.status !== 'Completed');
  const pendingCount = incompleteTasks.length;

  const handleMarkComplete = (taskId: string, title: string) => {
    if (window.confirm(`Mark "${title}" as completed?`)) {
      triggerCompletion([taskId]);
    }
  };

  const triggerCompletion = (ids: string[]) => {
    // Filter out already completing ones just in case
    setCompletingTaskIds(prev => [...prev, ...ids]);
    
    // Process each task
    ids.forEach(id => onUpdateTask(id, 'Completed'));
    
    // Clear selection
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));

    // Reset the animation state after it completes
    setTimeout(() => {
      setCompletingTaskIds(prev => prev.filter(id => !ids.includes(id)));
    }, 800);
  };

  const handleBulkComplete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Mark ${selectedIds.length} selected tasks as completed?`)) {
      triggerCompletion(selectedIds);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === incompleteTasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(incompleteTasks.map(t => t.id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-tighter">My Assignments</h1>
          <p className="text-gray-500 font-medium tracking-tight">Review and update your current workload at Srinidhi Associates.</p>
        </div>
        <div className="flex items-center gap-3">
          {incompleteTasks.length > 0 && (
            <button 
              onClick={toggleSelectAll}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all shadow-sm"
            >
              {selectedIds.length === incompleteTasks.length ? 'Deselect All' : 'Select All Active'}
            </button>
          )}
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
            <AlertCircle className="text-blue-600" size={18} />
            <span className="text-sm font-bold text-blue-900">{pendingCount} Active Tasks</span>
          </div>
        </div>
      </header>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-xl font-bold text-blue-900">All caught up!</h3>
          <p className="text-gray-400 font-medium max-w-xs mx-auto mt-2 italic">
            No active assignments detected for your profile. Take a well-deserved breather.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.sort((a,b) => a.status === 'Completed' ? 1 : -1).map(task => {
            const isCompleting = completingTaskIds.includes(task.id);
            const isSelected = selectedIds.includes(task.id);
            const isCompleted = task.status === 'Completed';
            
            return (
              <div 
                key={task.id} 
                className={`group bg-white p-6 rounded-[2rem] border transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden ${
                  isCompleting 
                    ? 'scale-[1.03] border-green-500 ring-4 ring-green-500/20 shadow-xl z-10' 
                    : isCompleted 
                      ? 'opacity-60 grayscale-[0.5] border-gray-100 bg-gray-50/30' 
                      : isSelected 
                        ? 'border-blue-900 bg-blue-50/30 shadow-md ring-4 ring-blue-900/5'
                        : 'hover:border-blue-200 border-gray-100 shadow-sm'
                }`}
              >
                {/* Completion Flash Overlay */}
                {isCompleting && (
                  <div className="absolute inset-0 bg-green-50/20 animate-pulse pointer-events-none" />
                )}

                <div className="flex items-center gap-4 flex-1">
                  {/* Selection Checkbox */}
                  {!isCompleted && !isCompleting && (
                    <button 
                      onClick={() => toggleSelection(task.id)}
                      className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20' 
                          : 'bg-gray-100 text-gray-300 hover:text-blue-900 hover:bg-blue-50'
                      }`}
                    >
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  )}

                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${
                      isCompleted || isCompleting ? 'bg-green-50 text-green-600' :
                      task.status === 'In Progress' ? 'bg-blue-900 text-white' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {isCompleted || isCompleting ? (
                        <CheckCircle size={24} className={isCompleting ? 'animate-bounce' : ''} />
                      ) : (
                        <Clock size={24} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-bold text-lg transition-all duration-500 truncate ${
                        isCompleted && !isCompleting ? 'line-through text-gray-400' : 'text-blue-900'
                      }`}>
                        {task.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <Calendar size={12} /> Due: {task.dueDate}
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-[0.2em] border ${
                          task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                          task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                          'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {task.priority} Priority
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-[0.2em] border transition-colors duration-500 ${
                          isCompleted || isCompleting ? 'bg-green-50 text-green-700 border-green-100' :
                          task.status === 'In Progress' ? 'bg-blue-50 text-blue-900 border-blue-100' :
                          'bg-gray-100 text-gray-400 border-gray-200'
                        }`}>
                          {isCompleting ? 'Finalizing...' : task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isCompleted && !isCompleting && (
                    <>
                      {task.status !== 'In Progress' && (
                        <button 
                          onClick={() => onUpdateTask(task.id, 'In Progress')}
                          className="px-5 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-900 transition-all active:scale-95"
                        >
                          Initialize
                        </button>
                      )}
                      <button 
                        onClick={() => handleMarkComplete(task.id, task.title)}
                        className="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 active:scale-95"
                      >
                        Complete
                      </button>
                    </>
                  )}
                  {isCompleted && !isCompleting && (
                    <button 
                      onClick={() => onUpdateTask(task.id, 'Pending')}
                      className="px-5 py-2.5 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[100] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-blue-900 text-white p-4 rounded-[2.5rem] shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-4 ml-4">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <CheckSquare size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">{selectedIds.length} Selected</p>
                <p className="text-[10px] font-bold text-white/60 uppercase">Bulk Action Mode</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleBulkComplete}
                className="px-6 py-3 bg-white text-blue-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-xl"
              >
                Complete Selected
              </button>
              <button 
                onClick={() => setSelectedIds([])}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
