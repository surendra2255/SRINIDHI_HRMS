
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, Trash2, Plus, Search } from 'lucide-react';
import { Document } from '../types';

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    { id: 'doc-1', name: 'Aadhar Card', type: 'Identification', uploadDate: '2023-08-15', status: 'Verified' },
    { id: 'doc-2', name: 'Degree Certificate', type: 'Education', uploadDate: '2023-08-16', status: 'Verified' },
    { id: 'doc-3', name: 'Previous Salary Slips', type: 'Experience', uploadDate: '2024-01-10', status: 'Pending' },
  ]);

  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: 'New Document Upload',
        type: 'Misc',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'Pending'
      };
      setDocuments([newDoc, ...documents]);
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Documents</h1>
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
          <div key={doc.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl group-hover:bg-blue-900 group-hover:text-white transition-colors">
                <FileText size={24} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                doc.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {doc.status}
              </span>
            </div>
            <h3 className="font-bold text-lg truncate mb-1">{doc.name}</h3>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-tight mb-4">{doc.type}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
              <div className="flex items-center gap-1 text-gray-400">
                <Clock size={14} />
                <span className="text-xs font-medium">{doc.uploadDate}</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <Trash2 size={16} />
              </button>
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
          <p className="text-sm text-blue-800/70 mt-1 max-w-2xl">
            All uploaded documents are reviewed by the Srinidhi Associates HR team. 
            Once verified, they will be marked as "Verified" and become part of your permanent employment record.
          </p>
        </div>
        <button className="px-6 py-3 bg-white text-blue-900 rounded-xl font-bold shadow-sm hover:shadow-md transition-all">
          View Guidelines
        </button>
      </div>
    </div>
  );
};

export default Documents;
