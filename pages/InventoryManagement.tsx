
import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit, 
  UserPlus, 
  Wrench, 
  Archive, 
  CheckCircle, 
  X, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Hash,
  Monitor,
  CalendarDays,
  Tag
} from 'lucide-react';
import { InventoryItem, Employee } from '../types';
import { INVENTORY_CATEGORIES } from '../constants';

interface InventoryManagementProps {
  employees: Employee[];
  addNotification: (userId: string, title: string, message: string) => void;
}

const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', assetId: 'SA-AS-101', name: 'MacBook Pro M2', category: 'Computing', serialNumber: 'C02FT12345', status: 'Assigned', assignedTo: 'Alice Johnson', purchaseDate: '2023-01-15', condition: 'New' },
  { id: 'inv-2', assetId: 'SA-AS-102', name: 'Dell UltraSharp 27"', category: 'Peripherals', serialNumber: 'DEL-998811', status: 'In Stock', purchaseDate: '2023-03-10', condition: 'Good' },
  { id: 'inv-3', assetId: 'SA-AS-103', name: 'Herman Miller Aeron', category: 'Furniture', serialNumber: 'HM-F-552', status: 'Assigned', assignedTo: 'Bob Smith', purchaseDate: '2022-11-20', condition: 'Fair' },
  { id: 'inv-4', assetId: 'SA-AS-104', name: 'Logitech MX Master 3', category: 'Peripherals', serialNumber: 'LG-M-001', status: 'Maintenance', purchaseDate: '2023-05-05', condition: 'Poor' },
];

const InventoryManagement: React.FC<InventoryManagementProps> = ({ employees, addNotification }) => {
  const [items, setItems] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [isAssigning, setIsAssigning] = useState<InventoryItem | null>(null);

  const [newItem, setNewItem] = useState({
    name: '',
    category: INVENTORY_CATEGORIES[0],
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    condition: 'New' as InventoryItem['condition']
  });

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchTerm, categoryFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: items.length,
    assigned: items.filter(i => i.status === 'Assigned').length,
    maintenance: items.filter(i => i.status === 'Maintenance').length,
    available: items.filter(i => i.status === 'In Stock').length,
  }), [items]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      assetId: `SA-AS-${items.length + 101}`,
      ...newItem,
      status: 'In Stock'
    };
    setItems(prev => [item, ...prev]);
    setIsAdding(false);
    setNewItem({ name: '', category: INVENTORY_CATEGORIES[0], serialNumber: '', purchaseDate: new Date().toISOString().split('T')[0], condition: 'New' });
  };

  const handleAssignAsset = (employeeName: string) => {
    if (!isAssigning) return;
    setItems(prev => prev.map(i => 
      i.id === isAssigning.id 
        ? { ...i, status: 'Assigned', assignedTo: employeeName } 
        : i
    ));
    
    const targetEmp = employees.find(e => e.name === employeeName);
    if (targetEmp) {
      addNotification(targetEmp.id, "Asset Assigned", `You have been assigned the asset: ${isAssigning.name} (${isAssigning.assetId}).`);
    }

    setIsAssigning(null);
  };

  const handleStatusChange = (id: string, status: InventoryItem['status']) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status, assignedTo: status === 'In Stock' ? undefined : i.assignedTo } : i));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Purge asset record from registry?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Inventory Registry</h1>
          <p className="text-gray-500 font-medium tracking-tight">Manage organizational assets, hardware deployments, and lifecycle audits.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
        >
          <Plus size={18} /> Register New Asset
        </button>
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Assets', val: stats.total, icon: <Package />, color: 'blue' },
          { label: 'Deployed', val: stats.assigned, icon: <UserPlus />, color: 'green' },
          { label: 'In Stock', val: stats.available, icon: <CheckCircle />, color: 'indigo' },
          { label: 'Maintenance', val: stats.maintenance, icon: <Wrench />, color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-900 rounded-2xl`}>
                {/* Fixed TypeScript error: Added <any> to React.ReactElement to allow passing 'size' prop in cloneElement */}
                {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 24 })}
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Audit</span>
            </div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-3xl font-black text-blue-900">{stat.val}</p>
          </div>
        ))}
      </section>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search assets by Name, ID, or Serial..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white transition-all font-bold text-sm text-blue-900"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900" size={16} />
            <select 
              className="pl-12 pr-10 py-4 bg-gray-50 border-transparent rounded-2xl text-xs font-black uppercase tracking-widest text-blue-900 outline-none appearance-none cursor-pointer"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {INVENTORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="relative group">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-900" size={16} />
            <select 
              className="pl-12 pr-10 py-4 bg-gray-50 border-transparent rounded-2xl text-xs font-black uppercase tracking-widest text-blue-900 outline-none appearance-none cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Assigned">Deployed</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Detail</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ID / Serial</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Deployment</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Registry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-blue-50/30 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-blue-900 shadow-sm">
                      <Monitor size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-blue-900">{item.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <p className="text-[10px] font-black text-blue-900 uppercase tracking-tighter">{item.assetId}</p>
                  <p className="text-[10px] font-bold text-gray-300 uppercase mt-1">S/N: {item.serialNumber}</p>
                </td>
                <td className="px-8 py-6">
                  {item.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-900 text-white flex items-center justify-center text-[8px] font-black uppercase">{item.assignedTo.charAt(0)}</div>
                      <p className="text-xs font-bold text-blue-900">{item.assignedTo}</p>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-gray-300 uppercase italic tracking-widest">Unassigned</span>
                  )}
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    item.status === 'Assigned' ? 'bg-green-50 text-green-700 border-green-100' :
                    item.status === 'Maintenance' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                    item.status === 'In Stock' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                    'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setIsAssigning(item)}
                        className="p-2 text-blue-900 hover:bg-white rounded-xl transition-all shadow-sm group-hover:shadow-md"
                        title="Assign Asset"
                      >
                        <UserPlus size={18} />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(item.id, 'Maintenance')}
                        className="p-2 text-orange-600 hover:bg-white rounded-xl transition-all shadow-sm group-hover:shadow-md"
                        title="Send for Maintenance"
                      >
                        <Wrench size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm group-hover:shadow-md"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <Archive size={48} className="mx-auto text-gray-100" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registry Search Yielded No Matching Assets</p>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsAdding(false)}></div>
          <div className="relative bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-400">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900 text-white rounded-2xl shadow-lg"><Plus size={20}/></div>
                <h2 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Register Asset</h2>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={20}/></button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Nomenclature</label>
                <input required className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl font-bold text-sm text-blue-900 outline-none focus:bg-white focus:ring-4 focus:ring-blue-900/5 transition-all" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. MacBook Pro M3 Max" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Classification</label>
                  <select className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl font-bold text-xs text-blue-900 outline-none" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                    {INVENTORY_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Condition</label>
                  <select className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl font-bold text-xs text-blue-900 outline-none" value={newItem.condition} onChange={e => setNewItem({...newItem, condition: e.target.value as any})}>
                    <option>New</option>
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Poor</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Serial Identifier</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input required className="w-full pl-12 pr-6 py-4 bg-gray-50 border-transparent rounded-2xl font-bold text-sm text-blue-900 outline-none focus:bg-white transition-all" value={newItem.serialNumber} onChange={e => setNewItem({...newItem, serialNumber: e.target.value})} placeholder="UUID / Serial Number" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Acquisition Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input type="date" className="w-full pl-12 pr-6 py-4 bg-gray-50 border-transparent rounded-2xl font-bold text-sm text-blue-900 outline-none focus:bg-white transition-all" value={newItem.purchaseDate} onChange={e => setNewItem({...newItem, purchaseDate: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-3">Commit to Inventory <ArrowRight size={18} /></button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Asset Modal */}
      {isAssigning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsAssigning(null)}></div>
          <div className="relative bg-white rounded-[3.5rem] p-12 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-400">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-blue-900 text-white rounded-3xl"><UserPlus size={24}/></div>
              <div>
                <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Deploy Asset</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigning: {isAssigning.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Personnel</label>
              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                {employees.map(emp => (
                  <button 
                    key={emp.id}
                    onClick={() => handleAssignAsset(emp.name)}
                    className="w-full p-4 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-2xl flex items-center gap-4 transition-all group"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-900 font-black group-hover:bg-blue-900 group-hover:text-white transition-colors">{emp.name.charAt(0)}</div>
                    <div className="text-left">
                      <p className="text-xs font-black text-blue-900 uppercase">{emp.name}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{emp.department}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setIsAssigning(null)} className="w-full mt-8 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel Deployment</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
