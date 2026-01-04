
import React from 'react';
import { Users, Briefcase, Calendar, Star, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import StatsCard from '../components/StatsCard';

const data = [
  { name: 'Eng', count: 45 },
  { name: 'Product', count: 28 },
  { name: 'Design', count: 18 },
  { name: 'HR', count: 12 },
  { name: 'Sales', count: 35 },
  { name: 'Finance', count: 15 },
];

const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, HR Team!</h1>
          <p className="text-gray-500">Here's what's happening at Nexus today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-50">Export Report</button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">+ Add Employee</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Employees" value="153" change="+4.5%" trend="up" icon={<Users size={20} />} />
        <StatsCard title="Open Positions" value="12" change="+2" trend="up" icon={<Briefcase size={20} />} />
        <StatsCard title="Active Projects" value="48" change="-3%" trend="down" icon={<Star size={20} />} />
        <StatsCard title="Attendance Rate" value="98.2%" change="+0.2%" trend="up" icon={<TrendingUp size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Headcount by Department</h2>
            <select className="bg-gray-50 border-none text-sm font-medium p-2 rounded-lg outline-none cursor-pointer">
              <option>This Quarter</option>
              <option>Last Quarter</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6">Upcoming Leaves</h2>
          <div className="space-y-4">
            {[
              { name: 'Sarah Wilson', date: 'Tomorrow', type: 'Vacation', avatar: 'https://picsum.photos/seed/sarah/40/40' },
              { name: 'Mark Evans', date: 'Oct 24', type: 'Sick Leave', avatar: 'https://picsum.photos/seed/mark/40/40' },
              { name: 'Lily Rose', date: 'Oct 26', type: 'Personal', avatar: 'https://picsum.photos/seed/lily/40/40' },
              { name: 'James Doe', date: 'Oct 28', type: 'Vacation', avatar: 'https://picsum.photos/seed/james/40/40' },
            ].map((leave, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={leave.avatar} alt={leave.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-sm font-semibold">{leave.name}</p>
                    <p className="text-xs text-gray-500">{leave.type}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                  {leave.date}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            View All Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
