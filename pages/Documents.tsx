
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, Trash2, Plus, Search, ChevronDown, ChevronUp, History } from 'lucide-react';
import { Document } from '../types';

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    { 
      id: 'doc-1', 
      name: 'Aadhar Card', 
      type: 'Identification', 
      uploadDate: '2023-08-15', 
      status: 'Verified',
      statusHistory: [
        { status: 'Pending', timestamp: '2023-08-15 09:30 AM' },
        { status: 'Verified', timestamp: '2023-08-16 02:15 PM' }
      ]
    },
    { 
      id: 'doc-2', 
      name: 'Degree Certificate', 
      type: 'Education', 
      uploadDate: '2023-08-16', 
      status: 'Verified',
      statusHistory: [
        { status: 'Pending', timestamp: '2023-08-16 11:00 AM' },
        { status: 'Verified', timestamp: '2023-08-17 10:45 AM' }
      ]
    },
    { 
      id: 'doc-3', 
      name: 'Previous Salary Slips', 
      type: 'Experience', 
      uploadDate: '2024-01-10', 
      status: 'Pending',
      statusHistory: [
        { status: 'Pending', timestamp: '2024-01-10 04:20 PM' }
      ]
    },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  const handleUpload = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const now = new Date();
      const timestamp = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: 'New Document Upload',
        type: 'Misc',
        uploadDate: now.toISOString().split('T')[0],
        status: 'Pending',
        statusHistory: [
          { status: 'Pending', timestamp }
        ]
      };
      setDocuments([newDoc, ...documents]);
      setIsUploading(false);
    }, 1500);
  };

  const toggleHistory = (docId: string) => {
    setExpandedDocId(expandedDocId === docId ? null : docId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">My Documents</h1>
          <p className="text-gray-500">Manage your verified credentials and personal records.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            onChange={handleUpload}
          />
          <label 
            htmlFor="file-upload"
            className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-900/10 transition-all active:scale-95"
          >
            {isUploading ? <Plus className="animate-spin" size={18} /> : <Upload size={18} />}
            Upload New Document
          </label>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => (
          <div key={doc.id} className="flex flex-col h-fit">
            <div className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:border-blue-200 overflow-hidden ${expandedDocId === doc.id ? 'ring-2 ring-blue-900/5' : 'border-gray-100'}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-900 rounded-xl">
                    <FileText size={24} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                    doc.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg truncate mb-1 text-blue-900">{doc.name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">{doc.type}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock size={14} />
                      <span className="text-xs font-bold">{doc.uploadDate}</span>
                    </div>
                    <button 
                      onClick={() => toggleHistory(doc.id)}
                      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                        expandedDocId === doc.id ? 'text-blue-900' : 'text-gray-400 hover:text-blue-900'
                      }`}
                    >
                      <History size={14} />
                      History
                      {expandedDocId === doc.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                  <button className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Expandable History Section */}
              {expandedDocId === doc.id && (
                <div className="bg-gray-50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2 duration-300">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Verification Timeline</h4>
                  <div className="space-y-4 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-200"></div>
                    
                    {doc.statusHistory?.map((entry, idx) => (
                      <div key={idx} className="flex gap-4 relative z-10">
                        <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm mt-1 flex-shrink-0 ${
                          entry.status === 'Verified' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-blue-900">Status changed to {entry.status}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">{entry.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-900 shadow-sm flex-shrink-0">
          <CheckCircle size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-blue-900">Document Verification Process</h3>
          <p className="text-sm text-blue-800/70 mt-1 max-w-2xl font-medium">
            All uploaded documents are reviewed by the Srinidhi Associates HR team. 
            Once verified, they will be marked as "Verified" and become part of your permanent employment record. 
            You can track the verification status history for each document.
          </p>
        </div>
        <button className="px-6 py-3 bg-white text-blue-900 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95">
          View Guidelines
        </button>
      </div>
    </div>
  );
};

export default Documents;
