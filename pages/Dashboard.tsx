
import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Star, 
  TrendingUp, 
  FileCheck, 
  Award, 
  Activity, 
  Clock, 
  ArrowUpRight, 
  Layout, 
  Bell, 
  Settings,
  DollarSign,
  Database,
  MapPin,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  AreaChart, 
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import StatsCard from '../components/StatsCard';
import Skeleton from '../components/Skeleton';

const data = [
  { name: 'Eng', count: 45 },
  { name: 'Product', count: 28 },
  { name: 'Design', count: 18 },
  { name: 'HR', count: 12 },
  { name: 'Sales', count: 35 },
  { name: 'Finance', count: 15 }
];

const recoveryData = [
  { day: 'Mon', amount: 45000 },
  { day: 'Tue', amount: 52000 },
  { day: 'Wed', amount: 38000 },
  { day: 'Thu', amount: 65000 },
  { day: 'Fri', amount: 48000 },
  { day: 'Sat', amount: 25000 },
  { day: 'Sun', amount: 15000 },
];

const COLORS = ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const Dashboard: React.FC = () => {
  const [activeWidgets, setActiveWidgets] = useState(['staff', 'requests', 'openings', 'attendance']);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa']
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter serif">Executive Command</h1>
          <p className="text-gray-500 font-medium">SRINIDHI ASSOCIATES &bull; Real-time Intelligence Hub</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={triggerConfetti}
            className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
          >
            <Sparkles size={16} /> Celebrate Success
          </button>
          <button 
            onClick={handleRefresh}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-900 shadow-sm hover:shadow-md transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-900 shadow-sm hover:shadow-md transition-all">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6"
      >
        {/* Stats Cards - Row 1 */}
        <motion.div variants={item} className="lg:col-span-3">
          {isLoading ? <Skeleton className="h-32" /> : <StatsCard title="Total Staff" value="153" change="+4.5%" trend="up" icon={<Users size={20} />} />}
        </motion.div>
        <motion.div variants={item} className="lg:col-span-3">
          {isLoading ? <Skeleton className="h-32" /> : <StatsCard title="Pending Requests" value="12" change="+2" trend="up" icon={<Calendar size={20} />} />}
        </motion.div>
        <motion.div variants={item} className="lg:col-span-3">
          {isLoading ? <Skeleton className="h-32" /> : <StatsCard title="Open Openings" value="08" change="Stable" trend="neutral" icon={<Briefcase size={20} />} />}
        </motion.div>
        <motion.div variants={item} className="lg:col-span-3">
          {isLoading ? <Skeleton className="h-32" /> : <StatsCard title="Avg Attendance" value="98.2%" change="+0.2%" trend="up" icon={<TrendingUp size={20} />} />}
        </motion.div>

        {/* Main Analytics - Large Tile */}
        <motion.div variants={item} className="lg:col-span-8 lg:row-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">Departmental Density</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Personnel distribution across verticals</p>
            </div>
            <div className="p-1.5 bg-gray-50 rounded-2xl flex border border-gray-100">
              <button className="px-4 py-2 bg-white shadow-sm text-[9px] font-black uppercase tracking-widest rounded-xl text-blue-900">Count</button>
              <button className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-900">Growth</button>
            </div>
          </div>
          <div className="h-[400px]">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={45}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Pulse - Tall Tile */}
        <motion.div variants={item} className="lg:col-span-4 lg:row-span-3 bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight flex items-center gap-3">
              <Activity size={20} className="text-blue-900" /> Pulse
            </h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-900 rounded-lg text-[8px] font-black uppercase tracking-widest">Live</span>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
            {[
              { user: 'Alice J.', action: 'logged a field visit', time: '2m ago', type: 'field', icon: <MapPin size={12}/> },
              { user: 'System', action: 'New recovery case REC-005', time: '15m ago', type: 'crm', icon: <Database size={12}/> },
              { user: 'Bob S.', action: 'submitted an expense', time: '1h ago', type: 'expense', icon: <DollarSign size={12}/> },
              { user: 'IT Support', action: 'resolved ticket #IT-102', time: '3h ago', type: 'it', icon: <Clock size={12}/> },
              { user: 'Diana P.', action: 'updated HR policy', time: '5h ago', type: 'hr', icon: <FileCheck size={12}/> },
              { user: 'Charlie D.', action: 'requested leave', time: 'Yesterday', type: 'hr', icon: <Calendar size={12}/> },
              { user: 'System', action: 'Monthly audit scheduled', time: 'Yesterday', type: 'admin', icon: <Bell size={12}/> }
            ].map((activity, idx) => (
              <div key={idx} className="flex gap-4 group cursor-pointer">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-all shadow-sm">
                    {activity.icon}
                  </div>
                  {idx !== 6 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1px] h-6 bg-gray-100"></div>}
                </div>
                <div className="pt-1">
                  <p className="text-xs font-bold text-gray-900">
                    <span className="text-blue-900 font-black">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-10 py-5 bg-gray-50 text-blue-900 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-blue-100 transition-all">
            View Full Audit Log
          </button>
        </motion.div>

        {/* Recovery Trend - Medium Tile */}
        <motion.div variants={item} className="lg:col-span-4 bg-blue-900 text-white p-8 rounded-[3rem] shadow-2xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-300 mb-6">Recovery Trend</h3>
            <div className="h-40">
              {isLoading ? (
                <Skeleton className="w-full h-full bg-white/10" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recoveryData}>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e3a8a', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#60a5fa" 
                      strokeWidth={4} 
                      dot={{ fill: '#60a5fa', r: 4, strokeWidth: 2, stroke: '#1e3a8a' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black tracking-tight">₹2.8M</p>
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Weekly Recovery</p>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <ArrowUpRight size={20} className="text-blue-300" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Department Distribution - Medium Tile */}
        <motion.div variants={item} className="lg:col-span-4 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Department Distribution</h3>
            <div className="p-2 bg-blue-50 text-blue-900 rounded-xl">
              <Activity size={16} />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-48 w-full md:w-1/2">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
              {data.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase">{d.name}</span>
                    <span className="text-xs font-bold text-blue-900">{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
