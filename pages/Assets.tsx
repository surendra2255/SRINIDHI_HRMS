
import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  User, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  Download,
  History,
  ArrowRight
} from 'lucide-react';
import { InventoryItem, User as UserType } from '../types';
import { exportToCSV } from '../lib/exportUtils';

interface AssetsProps {
  user: UserType;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  logAction: (module: string, action: string, details: string) => void;
}

const Assets: React.FC<AssetsProps> = ({ user, inventory, setInventory, logAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.assetId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExport = () => {
    exportToCSV(filteredInventory, 'asset_inventory', {
      assetId: 'Asset ID',
      name: 'Asset Name',
      category: 'Category',
      serialNumber: 'Serial Number',
      status: 'Status',
      assignedTo: 'Assigned To',
      purchaseDate: 'Purchase Date',
      condition: 'Condition'
    });
    logAction('Inventory', 'Export Data', `Exported ${filteredInventory.length} assets to CSV`);
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-700 border-green-200';
      case 'Assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Maintenance': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Retired': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter serif">Asset Tracking</h1>
          <p className="text-gray-500 font-medium">Manage and track company property and equipment.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Download size={18} /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20">
            <Plus size={18} /> Add Asset
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Assets', value: inventory.length, icon: <Package className="text-blue-600" /> },
          { label: 'Assigned', value: inventory.filter(i => i.status === 'Assigned').length, icon: <User className="text-purple-600" /> },
          { label: 'In Stock', value: inventory.filter(i => i.status === 'In Stock').length, icon: <ShieldCheck className="text-green-600" /> },
          { label: 'Maintenance', value: inventory.filter(i => i.status === 'Maintenance').length, icon: <AlertCircle className="text-orange-600" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl">{stat.icon}</div>
            </div>
            <p className="text-2xl font-black text-blue-900">{stat.value}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, serial or ID..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <select 
              className="px-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-blue-900 outline-none cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Computing">Computing</option>
              <option value="Peripherals">Peripherals</option>
              <option value="Mobile Devices">Mobile Devices</option>
              <option value="Furniture">Furniture</option>
            </select>
            <select 
              className="px-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-blue-900 outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Assigned">Assigned</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Serial Number</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned To</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-blue-900">{item.assetId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{item.category}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-gray-500">{item.serialNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    {item.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-900">
                          {item.assignedTo.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-gray-700">{item.assignedTo}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-gray-300 uppercase italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View History"><History size={16} /></button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Assets;
