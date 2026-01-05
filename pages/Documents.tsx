
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Clock, 
  Trash2, 
  ChevronDown, 
  History, 
  Edit2, 
  Save, 
  ShieldCheck, 
  AlertCircle, 
  TriangleAlert, 
  Loader2, 
  FileUp, 
  X, 
  FileSearch, 
  Search, 
  UserCircle, 
  Hash, 
  Filter, 
  User, 
  ShieldHalf, 
  Download, 
  Info,
  Files,
  UserCheck,
  CheckSquare,
  Square,
  ArrowRight,
  CalendarDays,
  Activity
} from 'lucide-react';
import { Document, Employee, User as UserType } from '../types';

interface DocumentsProps {
  user: UserType;
  allEmployees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  addNotification: (userId: string, title: string, message: string) => void;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  size: string;
  status: 'uploading' | 'completed' | 'cancelled';
  intervalId?: number;
}

const Documents: React.FC<DocumentsProps> = ({ user, allEmployees, setEmployees, addNotification }) => {
  const isHR = user.role === 'HR';
  
  // States for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [personnelSearch, setPersonnelSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Pending'>('All');
  
  // UI States
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [docToDelete, setDocToDelete] = useState<{ docId: string; ownerId: string; name: string } | null>(null);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      uploadQueue.forEach(u => {
        if (u.intervalId) clearInterval(u.intervalId);
      });
    };
  }, [uploadQueue]);

  // Reset confirmation checkbox when modal closes
  useEffect(() => {
    if (!docToDelete) {
      setIsDeleteConfirmed(false);
    }
  }, [docToDelete]);

  const processedDocs = useMemo(() => {
    let list: Array<Document & { ownerName: string; ownerId: string; ownerEmployeeId: string }> = [];
    
    if (isHR) {
      allEmployees.forEach(emp => {
        (emp.documents || []).forEach(doc => {
          list.push({
            ...doc,
            ownerName: emp.name,
            ownerId: emp.id,
            ownerEmployeeId: emp.employeeId
          });
        });
      });
    } else {
      const currentEmp = allEmployees.find(e => e.id === user.id);
      if (currentEmp) {
        (currentEmp.documents || []).forEach(doc => {
          list.push({
            ...doc,
            ownerName: currentEmp.name,
            ownerId: currentEmp.id,
            ownerEmployeeId: currentEmp.employeeId
          });
        });
      }
    }

    return list.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPersonnel = isHR ? (
        doc.ownerName.toLowerCase().includes(personnelSearch.toLowerCase()) ||
        doc.ownerEmployeeId.toLowerCase().includes(personnelSearch.toLowerCase())
      ) : true;
      const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
      
      return matchesSearch && matchesPersonnel && matchesStatus;
    });
  }, [allEmployees, isHR, user.id, searchTerm, personnelSearch, statusFilter]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);
    
    selectedFiles.forEach(file => {
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newUpload: UploadingFile = {
        id: uploadId,
        name: file.name,
        progress: 0,
        size: formatFileSize(file.size),
        status: 'uploading'
      };

      let progress = 0;
      const interval = window.setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 5;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setTimeout(() => {
            const now = new Date();
            const timestamp = now.toLocaleString('en-US', { 
              month: 'short', 
              day: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true 
            });

            const newDoc: Document = {
              id: `doc-${Date.now()}-${Math.random()}`,
              name: file.name.split('.').slice(0, -1).join('.') || file.name,
              type: 'Registry Record',
              uploadDate: now.toISOString().split('T')[0],
              status: 'Pending',
              statusHistory: [{ status: 'Pending', timestamp }]
            };

            setEmployees(prev => prev.map(emp => 
              emp.id === user.id ? { ...emp, documents: [newDoc, ...(emp.documents || [])] } : emp
            ));
            
            setUploadQueue(prev => prev.filter(u => u.id !== uploadId));
            addNotification(user.id, "Document Deposited", `"${newDoc.name}" has been added to the registry and is awaiting verification.`);
          }, 600);
        }

        setUploadQueue(prev => prev.map(u => u.id === uploadId ? { ...u, progress } : u));
      }, 400);

      newUpload.intervalId = interval;
      setUploadQueue(prev => [...prev, newUpload]);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cancelUpload = (id: string) => {
    setUploadQueue(prev => {
      const target = prev.find(u => u.id === id);
      if (target?.intervalId) clearInterval(target.intervalId);
      return prev.filter(u => u.id !== id);
    });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const toggleHistory = (docId: string) => {
    setExpandedDocId(expandedDocId === docId ? null : docId);
  };

  const startEditing = (doc: Document & { ownerId: string }) => {
    if (doc.ownerId !== user.id) return;
    setEditingDocId(doc.id);
    setEditName(doc.name);
    setEditType(doc.type);
  };

  const saveEdit = (docId: string, ownerId: string) => {
    if (!editName.trim()) return;
    setEmployees(prev => prev.map(emp => {
      if (emp.id === ownerId) {
        return {
          ...emp,
          documents: (emp.documents || []).map(d => 
            d.id === docId ? { ...d, name: editName, type: editType } : d
          )
        };
      }
      return emp;
    }));
    setEditingDocId(null);
  };

  const verifyDoc = (docId: string, ownerId: string) => {
    if (!isHR) return;
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    
    const verifierIdentity = `${user.name} [ID: ${user.id}]`;

    setEmployees(prev => prev.map(emp => {
      if (emp.id === ownerId) {
        const docName = emp.documents?.find(d => d.id === docId)?.name;
        addNotification(ownerId, "Verification Approved", `Administrator ${user.name} has verified your record: "${docName}".`);
        return {
          ...emp,
          documents: (emp.documents || []).map(d => {
            if (d.id === docId) {
              const history = d.statusHistory || [];
              return {
                ...d,
                status: 'Verified' as const,
                verifiedBy: verifierIdentity,
                statusHistory: [...history, { status: 'Verified' as const, timestamp, verifiedBy: verifierIdentity }]
              };
            }
            return d;
          })
        };
      }
      return emp;
    }));
  };

  const finalizeDelete = () => {
    if (docToDelete && isDeleteConfirmed) {
      const { docId, ownerId } = docToDelete;
      const canDelete = isHR || ownerId === user.id;
      
      if (canDelete) {
        setEmployees(prev => prev.map(emp => {
          if (emp.id === ownerId) {
            return {
              ...emp,
              documents: (emp.documents || []).filter(d => d.id !== docId)
            };
          }
          return emp;
        }));
      }
      setDocToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-tighter">
            {isHR ? 'Global Registry' : 'My Personnel File'}
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">
            {isHR 
              ? 'Administrative Audit: Oversee and verify organizational compliance documents.' 
              : 'Professional Dossier: Manage your records and certifications.'}
          </p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            id="file-upload" 
            multiple
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <label 
            htmlFor="file-upload"
            className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-900/10 transition-all active:scale-95 text-xs uppercase tracking-widest"
          >
            <Upload size={16} />
            Quick Upload
          </label>
        </div>
      </header>

      {/* Drag & Drop Zone */}
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-[3rem] p-12 transition-all duration-500 text-center group ${
          isDragging 
            ? 'bg-blue-50 border-blue-400 scale-[0.99] ring-4 ring-blue-900/5' 
            : 'bg-white border-gray-100 hover:border-blue-200'
        }`}
      >
        <div className="flex flex-col items-center">
          <div className={`p-6 rounded-[2rem] mb-6 transition-all duration-500 ${
            isDragging ? 'bg-blue-900 text-white shadow-xl rotate-12' : 'bg-blue-50 text-blue-900'
          }`}>
            <Files size={40} />
          </div>
          <h2 className="text-xl font-bold text-blue-900 mb-2">Drop Personnel Records Here</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Supports multiple PDF, JPG, or PNG files</p>
        </div>
        {isDragging && (
          <div className="absolute inset-0 bg-blue-900/5 backdrop-blur-[1px] rounded-[3rem] pointer-events-none flex items-center justify-center">
            <div className="px-6 py-2 bg-blue-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce">
              Release to Deposit
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress Queue */}
      {uploadQueue.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-blue-100 p-8 shadow-sm animate-in slide-in-from-top-4 duration-500 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-600" /> Transferring to Registry
            </h2>
            <span className="text-[10px] font-black text-blue-900 bg-blue-50 px-4 py-1.5 rounded-xl uppercase tracking-widest">
              {uploadQueue.length} Active Transfers
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploadQueue.map(upload => (
              <div key={upload.id} className="p-5 bg-gray-50/50 rounded-3xl border border-gray-100 relative group animate-in zoom-in-95 duration-300">
                <button 
                  onClick={() => cancelUpload(upload.id)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <X size={14} />
                </button>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-900 shrink-0">
                    <FileUp size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-blue-900 truncate pr-4">{upload.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{upload.size}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">
                      {upload.progress === 100 ? 'Registry Commitment...' : 'Transferring...'}
                    </span>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{upload.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-white border border-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-900 transition-all duration-500 ease-out" 
                      style={{ width: `${upload.progress}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search documents by label or ID..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-900/5 transition-all text-sm font-bold text-blue-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isHR && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 sm:w-64">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Find by associate..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-900/5 transition-all text-sm font-bold text-blue-900"
                value={personnelSearch}
                onChange={(e) => setPersonnelSearch(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-12 pr-10 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none text-xs font-black uppercase tracking-widest appearance-none cursor-pointer text-blue-900"
              >
                <option value="All">All Statuses</option>
                <option value="Verified">Verified Only</option>
                <option value="Pending">Pending Audit</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>
        )}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedDocs.length === 0 ? (
          <div className="col-span-full py-24 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto shadow-inner"><FileSearch size={40} /></div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">Registry Search Complete: No matching records</p>
          </div>
        ) : (
          processedDocs.map(doc => (
            <div key={doc.id} className="flex flex-col h-fit">
              <div className={`bg-white rounded-[2.5rem] border transition-all duration-300 shadow-sm hover:border-blue-200 overflow-hidden ${expandedDocId === doc.id ? 'ring-4 ring-blue-900/5 shadow-md' : 'border-gray-100'}`}>
                <div className="p-8">
                  {isHR && (
                    <div className="mb-6 flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-[10px] font-black text-white">{doc.ownerName.charAt(0)}</div>
                        <div>
                          <p className="text-[10px] font-black text-blue-900 uppercase leading-none">{doc.ownerName}</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">{doc.ownerEmployeeId}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-blue-50 text-blue-900 rounded-2xl"><FileText size={24} /></div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${
                      doc.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                    }`}>{doc.status}</span>
                  </div>

                  {editingDocId === doc.id ? (
                    <div className="space-y-4 mb-4 animate-in fade-in zoom-in-95 duration-200">
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-blue-100 rounded-xl font-bold text-blue-900 text-sm outline-none shadow-inner" autoFocus />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(doc.id, doc.ownerId)} className="flex-1 py-3 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10"><Save size={14} /> Commit</button>
                        <button onClick={() => setEditingDocId(null)} className="px-4 py-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-all"><X size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold text-lg truncate mb-1 text-blue-900">{doc.name}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">{doc.type}</p>
                      
                      {/* Explicitly displaying the Audit Verifier information on the document card */}
                      {doc.verifiedBy && (
                        <div className="flex items-center gap-2.5 py-2.5 px-3.5 bg-green-50/50 border border-green-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500 mb-2">
                          <UserCheck size={14} className="text-green-600" />
                          <div className="min-w-0">
                            <p className="text-[8px] font-black text-green-700 uppercase tracking-widest">Digital Signature</p>
                            <p className="text-[10px] font-bold text-blue-900 truncate leading-none mt-0.5">{doc.verifiedBy}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-4">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleHistory(doc.id)} 
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          expandedDocId === doc.id 
                            ? 'bg-blue-900 text-white shadow-lg' 
                            : 'bg-gray-50 text-gray-400 hover:text-blue-900 hover:bg-blue-50'
                        }`}
                      >
                        <History size={12} /> Verification Timeline
                        {(doc.statusHistory?.length || 0) > 0 && (
                          <span className={`ml-1 flex items-center justify-center w-4 h-4 rounded-full text-[8px] ${
                            expandedDocId === doc.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {doc.statusHistory?.length}
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {isHR && doc.status !== 'Verified' && (
                        <button onClick={() => verifyDoc(doc.id, doc.ownerId)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all" title="Verify Entry"><ShieldCheck size={18}/></button>
                      )}
                      {doc.ownerId === user.id && (
                        <button onClick={() => startEditing(doc)} className="p-2 text-gray-300 hover:text-blue-900 transition-all" title="Manage Record"><Edit2 size={16} /></button>
                      )}
                      {(isHR || doc.ownerId === user.id) && (
                        <button onClick={() => setDocToDelete({ docId: doc.id, ownerId: doc.ownerId, name: doc.name })} className="p-2 text-gray-300 hover:text-red-500 transition-all" title="Purge Entry"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ENHANCED VERIFICATION HISTORY TIMELINE */}
                {expandedDocId === doc.id && (
                  <div className="bg-gray-50 border-t border-gray-100 p-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-blue-900" />
                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Verification Timeline</h4>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-lg">
                        <CalendarDays size={12} className="text-gray-400" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Chain of Custody</span>
                      </div>
                    </div>
                    
                    <div className="space-y-8 relative ml-2">
                      <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-blue-100"></div>
                      {(doc.statusHistory || []).map((entry, idx) => (
                        <div key={idx} className="flex gap-6 relative z-10 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                          <div className={`w-5 h-5 rounded-full border-4 border-white shadow-md mt-0.5 flex-shrink-0 flex items-center justify-center ${
                            entry.status === 'Verified' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}>
                            {entry.status === 'Verified' ? (
                              <ShieldCheck size={10} className="text-white" />
                            ) : (
                              <Clock size={10} className="text-white" />
                            )}
                          </div>
                          
                          <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-blue-200 transition-all">
                            <div className="absolute -left-2 top-3 w-4 h-4 bg-white border-l border-b border-gray-100 rotate-45 group-hover:border-blue-200 transition-all"></div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <p className={`text-xs font-black uppercase tracking-widest ${
                                entry.status === 'Verified' ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                {entry.status === 'Verified' ? 'Registry Verified' : 'Initial Deposit'}
                              </p>
                              <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg">
                                <Clock size={10} className="text-gray-400" />
                                <span className="text-[9px] font-black text-blue-900 uppercase tracking-tight">{entry.timestamp}</span>
                              </div>
                            </div>
                            
                            {entry.verifiedBy ? (
                              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-900">
                                  <UserCheck size={14} />
                                </div>
                                <div>
                                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Audit Performed By</p>
                                  <p className="text-[10px] font-bold text-blue-900 leading-none mt-1">{entry.verifiedBy}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-gray-400 font-bold italic mt-2">Document entered registry via employee dashboard.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDocToDelete(null)}></div>
          <div className="relative bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
                <TriangleAlert size={40} />
              </div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2 uppercase tracking-tighter">Authorize Purge</h2>
              <p className="text-sm text-gray-400 mb-6 font-medium leading-relaxed">
                You are about to permanently purge the following record from the {isHR ? 'global organizational registry' : 'personal personnel file'}:
              </p>
              
              <div className="w-full bg-red-50 p-6 rounded-3xl border border-red-100 mb-6 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <FileText size={18} className="text-red-600" />
                  <p className="text-sm font-black text-red-700 truncate">{docToDelete.name}</p>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black text-red-400 uppercase tracking-widest ml-7">
                  <Hash size={10} /> Registry ID: {docToDelete.docId}
                </div>
              </div>

              <div className="w-full space-y-4 mb-10">
                <button 
                  onClick={() => setIsDeleteConfirmed(!isDeleteConfirmed)}
                  className="flex items-start gap-3 text-left group transition-all"
                >
                  <div className={`mt-0.5 shrink-0 transition-all ${isDeleteConfirmed ? 'text-red-600' : 'text-gray-300 group-hover:text-red-300'}`}>
                    {isDeleteConfirmed ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-tight leading-snug transition-all ${isDeleteConfirmed ? 'text-red-700' : 'text-gray-400'}`}>
                    I acknowledge that this record and its entire audit trail will be permanently erased. This action cannot be undone.
                  </span>
                </button>
              </div>

              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={finalizeDelete} 
                  disabled={!isDeleteConfirmed}
                  className={`w-full py-5 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                    isDeleteConfirmed 
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' 
                      : 'bg-gray-100 text-gray-300 shadow-none cursor-not-allowed'
                  }`}
                >
                  Confirm Purge
                </button>
                <button 
                  onClick={() => setDocToDelete(null)} 
                  className="w-full py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                >
                  Abort Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
