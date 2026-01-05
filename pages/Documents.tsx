
import React, { useState, useRef, useMemo } from 'react';
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
  User
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
}

const Documents: React.FC<DocumentsProps> = ({ user, allEmployees, setEmployees, addNotification }) => {
  const isHR = user.role === 'HR';
  
  // States for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [personnelSearch, setPersonnelSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Pending'>('All');
  
  // UI States
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [docToDelete, setDocToDelete] = useState<{ docId: string; ownerId: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed: Get all documents with owner information if HR, or just own documents if Employee
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

    // Apply filters
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);
    
    selectedFiles.forEach(file => {
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newUpload: UploadingFile = {
        id: uploadId,
        name: file.name,
        progress: 0,
        size: formatFileSize(file.size)
      };

      setUploadQueue(prev => [...prev, newUpload]);

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setTimeout(() => {
            const now = new Date();
            const timestamp = now.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

            const newDoc: Document = {
              id: `doc-${Date.now()}-${Math.random()}`,
              name: file.name.split('.').slice(0, -1).join('.') || file.name,
              type: 'Misc',
              uploadDate: now.toISOString().split('T')[0],
              status: 'Pending',
              statusHistory: [{ status: 'Pending', timestamp }]
            };

            setEmployees(prev => prev.map(emp => 
              emp.id === user.id ? { ...emp, documents: [newDoc, ...(emp.documents || [])] } : emp
            ));
            
            setUploadQueue(prev => prev.filter(u => u.id !== uploadId));
          }, 500);
        }

        setUploadQueue(prev => prev.map(u => u.id === uploadId ? { ...u, progress } : u));
      }, 300);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleHistory = (docId: string) => {
    setExpandedDocId(expandedDocId === docId ? null : docId);
  };

  const startEditing = (doc: Document) => {
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
    const timestamp = now.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    setEmployees(prev => prev.map(emp => {
      if (emp.id === ownerId) {
        const docName = emp.documents?.find(d => d.id === docId)?.name;
        addNotification(ownerId, "Document Verified", `HR has verified your document: "${docName}".`);
        return {
          ...emp,
          documents: (emp.documents || []).map(d => {
            if (d.id === docId) {
              const history = d.statusHistory || [];
              return {
                ...d,
                status: 'Verified' as const,
                statusHistory: [...history, { status: 'Verified' as const, timestamp, verifiedBy: user.name }]
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
    if (docToDelete) {
      const { docId, ownerId } = docToDelete;
      setEmployees(prev => prev.map(emp => {
        if (emp.id === ownerId) {
          return {
            ...emp,
            documents: (emp.documents || []).filter(d => d.id !== docId)
          };
        }
        return emp;
      }));
      setDocToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-tighter">
            {isHR ? 'Document Management' : 'Document Registry'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isHR ? 'Audit and verify personnel credentials organization-wide.' : 'Tracking the verification status of your professional credentials.'}
          </p>
        </div>
        {!isHR && (
          <div className="flex gap-3">
            <input 
              type="file" 
              id="file-upload" 
              multiple
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <label 
              htmlFor="file-upload"
              className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-900/10 transition-all active:scale-95 text-xs uppercase tracking-widest"
            >
              <Upload size={16} />
              Upload Records
            </label>
          </div>
        )}
      </header>

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by document name..." 
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
                placeholder="Search by personnel..." 
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

      {/* Upload Queue for Employees */}
      {!isHR && uploadQueue.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-blue-100 p-8 shadow-sm animate-in slide-in-from-top-4 duration-500 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-600" /> Active Uploads
            </h2>
            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg uppercase">
              {uploadQueue.length} {uploadQueue.length === 1 ? 'Transfer' : 'Transfers'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadQueue.map(upload => (
              <div key={upload.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-900 shrink-0"><FileUp size={20} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-blue-900 truncate pr-4">{upload.name}</p>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter shrink-0">{upload.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-blue-100/50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-900 transition-all duration-300 ease-out" style={{ width: `${upload.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedDocs.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto"><FileSearch size={32} /></div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No matching records found</p>
          </div>
        ) : (
          processedDocs.map(doc => (
            <div key={doc.id} className="flex flex-col h-fit">
              <div className={`bg-white rounded-[2.5rem] border transition-all duration-300 shadow-sm hover:border-blue-200 overflow-hidden ${expandedDocId === doc.id ? 'ring-4 ring-blue-900/5' : 'border-gray-100'}`}>
                <div className="p-8">
                  {isHR && (
                    <div className="mb-6 flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-[10px] font-black text-white">{doc.ownerName.charAt(0)}</div>
                      <div>
                        <p className="text-[10px] font-black text-blue-900 uppercase leading-none">{doc.ownerName}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">{doc.ownerEmployeeId}</p>
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
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Label</label>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-blue-100 rounded-xl font-bold text-blue-900 text-sm outline-none" autoFocus />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(doc.id, doc.ownerId)} className="flex-1 py-3 bg-blue-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center justify-center gap-2"><Save size={14} /> Save</button>
                        <button onClick={() => setEditingDocId(null)} className="px-4 py-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-all"><X size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold text-lg truncate mb-1 text-blue-900">{doc.name}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">{doc.type}</p>
                    </>
                  )}
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Clock size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-tight">{doc.uploadDate}</span>
                      </div>
                      <button onClick={() => toggleHistory(doc.id)} className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${expandedDocId === doc.id ? 'text-blue-900' : 'text-gray-400 hover:text-blue-900 underline underline-offset-4'}`}>
                        <History size={12} /> Logs
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {isHR && doc.status !== 'Verified' && (
                        <button onClick={() => verifyDoc(doc.id, doc.ownerId)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all" title="Verify Document"><ShieldCheck size={18}/></button>
                      )}
                      {!isHR && (
                        <button onClick={() => startEditing(doc)} className="p-2 text-gray-200 hover:text-blue-900 transition-all" title="Edit entry"><Edit2 size={16} /></button>
                      )}
                      {(isHR || doc.ownerId === user.id) && (
                        <button onClick={() => setDocToDelete({ docId: doc.id, ownerId: doc.ownerId })} className="p-2 text-gray-200 hover:text-red-500 transition-all" title="Delete entry"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </div>
                </div>

                {/* History View */}
                {expandedDocId === doc.id && (
                  <div className="bg-blue-50/30 border-t border-gray-100 p-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em]">Audit Log</h4>
                    </div>
                    <div className="space-y-6 relative ml-1">
                      <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-blue-100"></div>
                      {(doc.statusHistory || []).length === 0 ? (
                        <div className="flex gap-4 relative z-10">
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm mt-0.5 bg-yellow-500 shrink-0" />
                          <div><p className="text-xs font-bold text-blue-900">Initial Upload</p><p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1 mt-0.5"><Clock size={10} /> {doc.uploadDate}</p></div>
                        </div>
                      ) : (
                        doc.statusHistory.map((entry, idx) => (
                          <div key={idx} className="flex gap-4 relative z-10">
                            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm mt-0.5 flex-shrink-0 flex items-center justify-center ${entry.status === 'Verified' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                              {entry.status === 'Verified' ? <ShieldCheck size={8} className="text-white" /> : <AlertCircle size={8} className="text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-blue-900">Status: <span className={entry.status === 'Verified' ? 'text-green-600' : 'text-yellow-600'}>{entry.status}</span></p>
                              {entry.verifiedBy && (
                                <p className="text-[10px] font-bold text-gray-500 mt-0.5">
                                  Verified by: <span className="text-blue-900">{entry.verifiedBy}</span>
                                </p>
                              )}
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1 mt-0.5"><Clock size={10} /> {entry.timestamp}</p>
                            </div>
                          </div>
                        ))
                      )}
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
          <div className="relative bg-white rounded-[3rem] p-10 max-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mb-8"><TriangleAlert size={40} /></div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2 uppercase tracking-tighter">Confirm Deletion</h2>
              <p className="text-sm text-gray-400 mb-10 font-medium">This record will be permanently purged from the personnel file. This action is irreversible.</p>
              <div className="flex flex-col w-full gap-3">
                <button onClick={finalizeDelete} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95">Purge Record</button>
                <button onClick={() => setDocToDelete(null)} className="w-full py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
