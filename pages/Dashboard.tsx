
import React from 'react';
import { Users, Briefcase, Calendar, Star, TrendingUp, FileCheck, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import StatsCard from '../components/StatsCard';

const data = [
  { name: 'Eng', count: 45 },
  { name: 'Product', count: 28 },
  { name: 'Design', count: 18 },
  { name: 'HR', count: 12 },
  { name: 'Sales', count: 35 },
  { name: 'Finance', count: 15 }
];

const COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workspace Overview</h1>
          <p className="text-gray-500 font-medium">SRINIDHI ASSOCIATES &bull; Internal Portal</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 text-gray-500">Reports</button>
          <button className="px-4 py-2 bg-blue-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-800 shadow-lg shadow-blue-900/10">Quick Action</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Staff" value="153" change="+4.5%" trend="up" icon={<Users size={20} />} />
        <StatsCard title="Pending Requests" value="12" change="+2" trend="up" icon={<Calendar size={20} />} />
        <StatsCard title="Open Openings" value="08" change="Stable" trend="neutral" icon={<Briefcase size={20} />} />
        <StatsCard title="Avg Attendance" value="98.2%" change="+0.2%" trend="up" icon={<TrendingUp size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-blue-900">Department Distribution</h2>
            <div className="p-1 bg-gray-50 rounded-lg flex">
              <button className="px-3 py-1 bg-white shadow-sm text-[10px] font-bold uppercase rounded-md">Count</button>
              <button className="px-3 py-1 text-[10px] font-bold uppercase text-gray-400">Growth</button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6 text-blue-900">Notices</h2>
          <div className="space-y-4">
            {[
              { title: 'New Leave Policy', category: 'HR Policy', date: 'Oct 20', icon: <FileCheck className="text-blue-500" /> },
              { title: 'Annual Gala Night', category: 'Events', date: 'Dec 15', icon: <Award className="text-purple-500" /> },
              { title: 'Tax Submission Deadline', category: 'Finance', date: 'Mar 31', icon: <Calendar className="text-red-500" /> }
            ].map((notice, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 hover:bg-blue-50/30 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                  {notice.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{notice.title}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{notice.category}</p>
                </div>
                <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-lg">
                  {notice.date}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-[10px] font-bold uppercase tracking-widest text-blue-900 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            View All Announcements
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
