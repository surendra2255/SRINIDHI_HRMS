
import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle, AlertTriangle, User, Search, Download, Filter } from 'lucide-react';
import { User as UserType } from '../types';

interface AttendanceProps {
  user: UserType;
}

interface AttendanceRecord {
  id: string;
  name: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: 'Present' | 'Late' | 'Absent' | 'On Leave';
  duration: string;
}

const Attendance: React.FC<AttendanceProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const MOCK_ATTENDANCE: AttendanceRecord[] = [
    { id: '1', name: 'Alice Johnson', employeeId: 'SA-001', date: '2024-05-15', clockIn: '08:45 AM', clockOut: '05:30 PM', status: 'Present', duration: '8h 45m' },
    { id: '2', name: 'Bob Smith', employeeId: 'SA-002', date: '2024-05-15', clockIn: '09:15 AM', clockOut: '06:00 PM', status: 'Late', duration: '8h 45m' },
    { id: '3', name: 'Charlie Davis', employeeId: 'SA-003', date: '2024-05-15', clockIn: '-', clockOut: '-', status: 'On Leave', duration: '-' },
    { id: '4', name: 'Diana Prince', employeeId: 'SA-004', date: '2024-05-15', clockIn: '08:55 AM', clockOut: '05:15 PM', status: 'Present', duration: '8h 20m' },
    { id: '5', name: 'Alice Johnson', employeeId: 'SA-001', date: '2024-05-14', clockIn: '08:50 AM', clockOut: '05:40 PM', status: 'Present', duration: '8h 50m' },
  ];

  const filteredRecords = MOCK_ATTENDANCE.filter(record => 
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-tighter">Attendance Registry</h1>
          <p className="text-gray-500 font-medium tracking-wide">Tracking personnel presence and operational hours.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 text-gray-500 transition-all shadow-sm">
            <Download size={14} /> Export Logs
          </button>
          {user.role === 'Employee' && (
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-800 shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
              <Clock size={14} /> Register Clock-In
            </button>
          )}
        </div>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Punctuality Rate</p>
            <p className="text-2xl font-black text-blue-900 mt-1">94.2%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Late Entries (MTD)</p>
            <p className="text-2xl font-black text-blue-900 mt-1">12</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Active Staff</p>
            <p className="text-2xl font-black text-blue-900 mt-1">148/153</p>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Historical Presence Log</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input 
                type="text" 
                placeholder="Find personnel..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-900/10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100"><Filter size={18} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Personnel</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Clock-In</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Clock-Out</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-900 font-black text-[10px]">
                        {record.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-blue-900">{record.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{record.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-500 uppercase tracking-tighter">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-blue-900">
                    {record.clockIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-blue-900">
                    {record.clockOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-gray-400 uppercase tracking-widest">
                    {record.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      record.status === 'Present' ? 'bg-green-50 text-green-700 border-green-100' :
                      record.status === 'Late' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      record.status === 'On Leave' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-gray-50/30 flex items-center justify-center">
          <button className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] hover:underline">Load Extended History</button>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
