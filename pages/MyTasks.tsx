
import React from 'react';
import { CheckCircle, Clock, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Employee, Task } from '../types';

interface MyTasksProps {
  employee: Employee;
  onUpdateTask: (taskId: string, status: Task['status']) => void;
}

const MyTasks: React.FC<MyTasksProps> = ({ employee, onUpdateTask }) => {
  const tasks = employee.tasks || [];
  const pendingCount = tasks.filter(t => t.status !== 'Completed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Assignments</h1>
          <p className="text-gray-500">Review and update your current workload.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
          <AlertCircle className="text-blue-600" size={18} />
          <span className="text-sm font-bold text-blue-900">{pendingCount} Active Tasks</span>
        </div>
      </header>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">No tasks assigned to you at the moment. Take a breather or check in with HR.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.sort((a,b) => a.status === 'Completed' ? 1 : -1).map(task => (
            <div 
              key={task.id} 
              className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                task.status === 'Completed' ? 'opacity-60 grayscale-[0.5]' : 'hover:border-blue-200'
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-xl ${
                  task.status === 'Completed' ? 'bg-green-50 text-green-600' :
                  task.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                  'bg-gray-50 text-gray-400'
                }`}>
                  {task.status === 'Completed' ? <CheckCircle size={24} /> : <Clock size={24} />}
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-blue-900'}`}>
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-tight">
                      <Calendar size={14} /> Due: {task.dueDate}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                      task.priority === 'High' ? 'bg-red-50 text-red-600' :
                      task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                      task.status === 'Completed' ? 'bg-green-50 text-green-700' :
                      task.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {task.status !== 'In Progress' && task.status !== 'Completed' && (
                  <button 
                    onClick={() => onUpdateTask(task.id, 'In Progress')}
                    className="px-4 py-2 bg-blue-50 text-blue-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-100 transition-all"
                  >
                    Start Task
                  </button>
                )}
                {task.status !== 'Completed' && (
                  <button 
                    onClick={() => {
                      if(window.confirm(`Mark "${task.title}" as completed?`)) {
                        onUpdateTask(task.id, 'Completed');
                      }
                    }}
                    className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10"
                  >
                    Mark Complete
                  </button>
                )}
                {task.status === 'Completed' && (
                  <button 
                    onClick={() => onUpdateTask(task.id, 'Pending')}
                    className="px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
