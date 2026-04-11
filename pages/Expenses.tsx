
import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Download,
  FileText
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Expense, User } from '../types';

interface ExpensesProps {
  user: User;
  addNotification: (userId: string, title: string, message: string) => void;
}

const MOCK_EXPENSES: Expense[] = [
  { id: 'exp-1', title: 'Field Visit Fuel', amount: 1200, category: 'Travel', date: '2026-04-01', status: 'Approved', submittedBy: 'Alice Johnson' },
  { id: 'exp-2', title: 'Legal Notice Printing', amount: 4500, category: 'Legal', date: '2026-04-03', status: 'Pending', submittedBy: 'Bob Smith' },
  { id: 'exp-3', title: 'Office Stationery', amount: 800, category: 'Office', date: '2026-04-05', status: 'Approved', submittedBy: 'Diana Prince' },
  { id: 'exp-4', title: 'New Recovery Tablet', amount: 15000, category: 'Equipment', date: '2026-04-06', status: 'Pending', submittedBy: 'Charlie Davis' },
  { id: 'exp-5', title: 'Client Meeting Lunch', amount: 2200, category: 'Marketing', date: '2026-04-07', status: 'Approved', submittedBy: 'Alice Johnson' },
];

const COLORS = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const Expenses: React.FC<ExpensesProps> = ({ user, addNotification }) => {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Travel' as Expense['category'],
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.amount) return;

    const expense: Expense = {
      id: `exp-${Date.now()}`,
      title: newExpense.title,
      amount: Number(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      status: 'Pending',
      submittedBy: user.name
    };

    setExpenses(prev => [expense, ...prev]);
    addNotification(user.id, 'Expense Submitted', `Your expense for "${expense.title}" has been submitted for approval.`);
    
    // Also notify HR
    addNotification('hr-admin', 'New Expense Request', `${user.name} submitted an expense of ₹${expense.amount} for ${expense.title}.`);

    setShowAddModal(false);
    setNewExpense({
      title: '',
      amount: '',
      category: 'Travel',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           e.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const categoryData = useMemo(() => {
    const data: { name: string, value: number }[] = [];
    const categories = ['Travel', 'Equipment', 'Office', 'Legal', 'Marketing', 'Other'];
    
    categories.forEach(cat => {
      const total = expenses
        .filter(e => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0);
      if (total > 0) data.push({ name: cat, value: total });
    });
    
    return data;
  }, [expenses]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter serif">Expense Tracking</h1>
          <p className="text-gray-500 font-medium">Manage organizational spending, reimbursements, and financial audits.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Download size={18} /> Export Report
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20"
          >
            <Plus size={20} /> Log Expense
          </button>
        </div>
      </div>

      {/* Stats & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mb-6">
                <TrendingDown size={24} />
              </div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Expenditure</h3>
              <p className="text-4xl font-black text-blue-900 tracking-tighter">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-green-600 font-bold text-xs">
              <TrendingUp size={14} /> <span>+12.5% from last month</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <Clock size={24} />
              </div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Pending Approval</h3>
              <p className="text-4xl font-black text-orange-600 tracking-tighter">₹{pendingExpenses.toLocaleString()}</p>
            </div>
            <div className="mt-8">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{expenses.filter(e => e.status === 'Pending').length} requests awaiting review</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm md:col-span-2">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Spending by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" fill="#1e3a8a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Allocation Breakdown</h3>
          <div className="flex-1 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
            {categoryData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[10px] font-black text-blue-900 uppercase tracking-tight">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-gray-400">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select 
                className="pl-12 pr-10 py-3 bg-gray-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-900 outline-none appearance-none cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Travel">Travel</option>
                <option value="Equipment">Equipment</option>
                <option value="Office">Office</option>
                <option value="Legal">Legal</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Expense Detail</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Submitted By</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-blue-900 shadow-sm">
                        <Receipt size={18} />
                      </div>
                      <p className="text-sm font-black text-blue-900">{exp.title}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{exp.category}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-gray-600">{exp.submittedBy}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                      <CalendarIcon size={14} /> {exp.date}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-blue-900">₹{exp.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      exp.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                      exp.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm" title="View Receipt"><FileText size={16} /></button>
                      {exp.status === 'Pending' && (
                        <>
                          <button className="p-2 text-green-600 hover:bg-white rounded-xl transition-all shadow-sm" title="Approve"><CheckCircle2 size={16} /></button>
                          <button className="p-2 text-red-600 hover:bg-white rounded-xl transition-all shadow-sm" title="Reject"><XCircle size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal (Simplified) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-blue-900/20 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Log Expense</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><XCircle size={20}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                <input 
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm text-blue-900 outline-none" 
                  placeholder="e.g. Travel Reimbursement" 
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm text-blue-900 outline-none" 
                    placeholder="0.00" 
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-xs text-blue-900 outline-none"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value as Expense['category']})}
                  >
                    <option>Travel</option>
                    <option>Equipment</option>
                    <option>Office</option>
                    <option>Legal</option>
                    <option>Marketing</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-sm text-blue-900 outline-none" 
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>

              <button 
                onClick={handleAddExpense}
                className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3"
              >
                Submit for Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
