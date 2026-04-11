
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
  Activity,
  CreditCard,
  CheckCircle2,
  FileBadge,
  CalendarClock,
  Briefcase,
  FolderOpen,
  HardDrive,
  Banknote,
  Calculator,
  Receipt
} from 'lucide-react';
import { Document, Employee, User as UserType } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [activeTab, setActiveTab] = useState<'general' | 'payslips' | 'drive'>('general');
  
  // UI States
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [docToDelete, setDocToDelete] = useState<{ docId: string; ownerId: string; name: string } | null>(null);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  
  // Payslip generation state (HR)
  const [isGeneratingPayslip, setIsGeneratingPayslip] = useState(false);
  const [payslipFormData, setPayslipFormData] = useState({
    employeeId: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString(),
    basicSalary: 0,
    hra: 0,
    conveyance: 0,
    specialAllowance: 0,
    pf: 0,
    professionalTax: 0,
    tds: 0,
    otherDeductions: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      uploadQueue.forEach(u => {
        if (u.intervalId) clearInterval(u.intervalId);
      });
    };
  }, [uploadQueue]);

  useEffect(() => {
    if (!docToDelete) {
      setIsDeleteConfirmed(false);
    }
  }, [docToDelete]);

  // Utility to check if a payslip period is within the last 3 months
  const isWithinLast3Months = (payslipName: string) => {
    const parts = payslipName.split(' ');
    if (parts.length < 2) return false;
    
    const monthName = parts[0];
    const year = parseInt(parts[1]);
    
    const monthMap: { [key: string]: number } = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    
    const payslipMonth = monthMap[monthName];
    if (payslipMonth === undefined || isNaN(year)) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const totalPayslipMonths = year * 12 + payslipMonth;
    const totalCurrentMonths = currentYear * 12 + currentMonth;
    
    const diff = totalCurrentMonths - totalPayslipMonths;
    return diff >= 0 && diff < 3;
  };

  const processedDocs = useMemo(() => {
    let list: Array<Document & { ownerName: string; ownerId: string; ownerEmployeeId: string }> = [];
    
    if (isHR) {
      allEmployees.forEach(emp => {
        (emp.documents || []).forEach(doc => {
          if (doc.type !== 'Payslip' && doc.type !== 'Drive') {
            list.push({
              ...doc,
              ownerName: emp.name,
              ownerId: emp.id,
              ownerEmployeeId: emp.employeeId
            });
          }
        });
      });
    } else {
      const currentEmp = allEmployees.find(e => e.id === user.id);
      if (currentEmp) {
        (currentEmp.documents || []).forEach(doc => {
          if (doc.type !== 'Payslip' && doc.type !== 'Drive') {
            list.push({
              ...doc,
              ownerName: currentEmp.name,
              ownerId: currentEmp.id,
              ownerEmployeeId: currentEmp.employeeId
            });
          }
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

  const driveDocs = useMemo(() => {
    let list: Array<Document & { ownerName: string; ownerId: string; ownerEmployeeId: string }> = [];
    
    if (isHR) {
      allEmployees.forEach(emp => {
        (emp.documents || []).forEach(doc => {
          if (doc.type === 'Drive') {
            list.push({
              ...doc,
              ownerName: emp.name,
              ownerId: emp.id,
              ownerEmployeeId: emp.employeeId
            });
          }
        });
      });
    } else {
      const currentEmp = allEmployees.find(e => e.id === user.id);
      if (currentEmp) {
        (currentEmp.documents || []).forEach(doc => {
          if (doc.type === 'Drive') {
            list.push({
              ...doc,
              ownerName: currentEmp.name,
              ownerId: currentEmp.id,
              ownerEmployeeId: currentEmp.employeeId
            });
          }
        });
      }
    }

    return list.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPersonnel = isHR ? (
        doc.ownerName.toLowerCase().includes(personnelSearch.toLowerCase()) ||
        doc.ownerEmployeeId.toLowerCase().includes(personnelSearch.toLowerCase())
      ) : true;
      
      return matchesSearch && matchesPersonnel;
    });
  }, [allEmployees, isHR, user.id, searchTerm, personnelSearch]);

  const payslips = useMemo(() => {
    let list: Array<Document & { ownerName: string; ownerId: string; ownerEmployeeId: string }> = [];
    
    if (isHR) {
      allEmployees.forEach(emp => {
        (emp.documents || []).forEach(doc => {
          if (doc.type === 'Payslip') {
            list.push({
              ...doc,
              ownerName: emp.name,
              ownerId: emp.id,
              ownerEmployeeId: emp.employeeId
            });
          }
        });
      });
    } else {
      const currentEmp = allEmployees.find(e => e.id === user.id);
      if (currentEmp) {
        (currentEmp.documents || []).forEach(doc => {
          if (doc.type === 'Payslip') {
            list.push({
              ...doc,
              ownerName: currentEmp.name,
              ownerId: currentEmp.id,
              ownerEmployeeId: currentEmp.employeeId
            });
          }
        });
      }
    }

    return list.filter(p => {
      const matchesPersonnel = isHR ? (
        p.ownerName.toLowerCase().includes(personnelSearch.toLowerCase()) ||
        p.ownerEmployeeId.toLowerCase().includes(personnelSearch.toLowerCase())
      ) : true;
      
      if (!matchesPersonnel) return false;

      if (!isHR) {
        return isWithinLast3Months(p.name);
      }

      return true;
    }).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [allEmployees, isHR, user.id, personnelSearch]);

  const handleDownloadGeneric = (doc: Document) => {
    // Determine extension from filename if possible, else default to .pdf
    const fileName = doc.name;
    const content = `
      SRINIDHI ASSOCIATES - DRIVE REGISTRY
      -------------------------------------
      Filename: ${fileName}
      Registry ID: ${doc.id}
      Uploaded: ${doc.uploadDate}
      
      This is a mock file generated for the Srinidhi HRMS Drive.
    `;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Attempt to keep extension or add generic one
    const fullFileName = fileName.includes('.') ? fileName : `${fileName}.pdf`;
    link.download = fullFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePayslipPDF = (data: any, employee: Employee) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text('SRINIDHI ASSOCIATES', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Professional HR Services & Consulting', pageWidth / 2, 27, { align: 'center' });
    
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 35, pageWidth - 20, 35);
    
    // Payslip Title
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text(`PAYSLIP FOR ${data.month.toUpperCase()} ${data.year}`, pageWidth / 2, 45, { align: 'center' });
    
    // Employee Details
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Employee Name: ${employee.name}`, 20, 60);
    doc.text(`Employee ID: ${employee.employeeId}`, 20, 67);
    doc.text(`Designation: ${employee.role}`, 20, 74);
    doc.text(`Department: ${employee.department}`, 20, 81);
    
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, pageWidth - 70, 60);
    doc.text(`Status: VERIFIED`, pageWidth - 70, 67);
    
    // Earnings & Deductions Table
    const earnings = [
      ['Basic Salary', data.basicSalary.toFixed(2)],
      ['HRA', data.hra.toFixed(2)],
      ['Conveyance', data.conveyance.toFixed(2)],
      ['Special Allowance', data.specialAllowance.toFixed(2)],
    ];
    
    const deductions = [
      ['Provident Fund (PF)', data.pf.toFixed(2)],
      ['Professional Tax', data.professionalTax.toFixed(2)],
      ['TDS', data.tds.toFixed(2)],
      ['Other Deductions', data.otherDeductions.toFixed(2)],
    ];
    
    const totalEarnings = data.basicSalary + data.hra + data.conveyance + data.specialAllowance;
    const totalDeductions = data.pf + data.professionalTax + data.tds + data.otherDeductions;
    const netSalary = totalEarnings - totalDeductions;
    
    autoTable(doc, {
      startY: 90,
      head: [['Earnings', 'Amount (INR)', 'Deductions', 'Amount (INR)']],
      body: [
        [earnings[0][0], earnings[0][1], deductions[0][0], deductions[0][1]],
        [earnings[1][0], earnings[1][1], deductions[1][0], deductions[1][1]],
        [earnings[2][0], earnings[2][1], deductions[2][0], deductions[2][1]],
        [earnings[3][0], earnings[3][1], deductions[3][0], deductions[3][1]],
        [{ content: 'Total Earnings', styles: { fontStyle: 'bold' } }, { content: totalEarnings.toFixed(2), styles: { fontStyle: 'bold' } }, { content: 'Total Deductions', styles: { fontStyle: 'bold' } }, { content: totalDeductions.toFixed(2), styles: { fontStyle: 'bold' } }],
      ],
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 4 },
    });
    
    // Net Salary
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`NET SALARY: INR ${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 20, finalY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`(In words: ${numberToWords(Math.round(netSalary))} Rupees Only)`, 20, finalY + 7);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is a computer-generated payslip and does not require a physical signature.', pageWidth / 2, pageWidth > 250 ? 280 : 270, { align: 'center' });
    doc.text('Srinidhi Associates - Confidential Document', pageWidth / 2, pageWidth > 250 ? 285 : 275, { align: 'center' });
    
    return doc;
  };

  const numberToWords = (num: number) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numStr = num.toString();
    if (numStr.length > 9) return 'overflow';
    const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return ''; 
    let str = '';
    str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str;
  };

  const handleDownloadPayslip = (payslip: Document & { ownerName: string; ownerId: string }) => {
    const targetEmp = allEmployees.find(emp => emp.id === payslip.ownerId);
    if (!targetEmp || !payslip.metadata) {
      // Fallback to generic if metadata is missing
      const content = `
        SRINIDHI ASSOCIATES - OFFICIAL PAYSLIP
        -------------------------------------
        Employee: ${payslip.ownerName}
        Document ID: ${payslip.id}
        Reference Month: ${payslip.name}
        Issue Date: ${payslip.uploadDate}
        Registry Status: VERIFIED
        
        This document is a digitally signed electronic record.
        Generated via Srinidhi HRMS Core.
      `;
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip_${payslip.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    const doc = generatePayslipPDF(payslip.metadata, targetEmp);
    doc.save(`Payslip_${targetEmp.name.replace(/\s+/g, '_')}_${payslip.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleDownloadRelievingLetter = (doc: Document & { ownerName: string }) => {
    const content = `
      SRINIDHI ASSOCIATES - OFFICIAL RELIEVING LETTER
      ----------------------------------------------
      Issue Date: ${doc.uploadDate}
      Registry UID: ${doc.id}
      
      To Whom It May Concern,
      
      This is to certify that ${doc.ownerName} was employed with Srinidhi Associates. 
      Their resignation has been processed, all work handovers are confirmed completed, 
      and they have been relieved of their duties as of ${doc.uploadDate}.
      
      We wish them success in their future endeavors.
      
      Digitally Signed: 
      Clearance Authority - Srinidhi Associates
      Verification Token: ${doc.id}
    `;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relieving_Letter_${doc.ownerName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGeneratePayslip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payslipFormData.employeeId) return;

    const targetEmp = allEmployees.find(emp => emp.id === payslipFormData.employeeId || emp.employeeId === payslipFormData.employeeId);
    if (!targetEmp) {
      alert("Employee ID not found in registry.");
      return;
    }

    const newPayslip: Document = {
      id: `ps-${Date.now()}`,
      name: `${payslipFormData.month} ${payslipFormData.year}`,
      type: 'Payslip',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Verified',
      verifiedBy: `Auto-System [Admin: ${user.name}]`,
      metadata: { ...payslipFormData },
      statusHistory: [{ 
        status: 'Verified', 
        timestamp: new Date().toLocaleString(),
        verifiedBy: `System Generator`
      }]
    };

    setEmployees(prev => prev.map(emp => 
      emp.id === targetEmp.id ? { ...emp, documents: [newPayslip, ...(emp.documents || [])] } : emp
    ));

    addNotification(targetEmp.id, "Payslip Released", `Your payslip for ${newPayslip.name} is now available for PDF download.`);
    setIsGeneratingPayslip(false);
    setPayslipFormData({
      employeeId: '',
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear().toString(),
      basicSalary: 0,
      hra: 0,
      conveyance: 0,
      specialAllowance: 0,
      pf: 0,
      professionalTax: 0,
      tds: 0,
      otherDeductions: 0
    });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFiles = Array.from(files);
    
    // Validation for Drive tab (PDF, XLSX, CSV, DOC)
    const allowedDriveExtensions = ['pdf', 'xlsx', 'csv', 'doc', 'docx'];
    
    selectedFiles.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (activeTab === 'drive' && !allowedDriveExtensions.includes(ext)) {
        alert(`File Type Not Allowed: My Drive accepts only PDF, XLSX, CSV, and DOC files. (Skipping: ${file.name})`);
        return;
      }

      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newUpload: UploadingFile = {
        id: uploadId,
        name: file.name,
        progress: 0,
        size: 'N/A',
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
              month: 'short', day: '2-digit', year: 'numeric', 
              hour: '2-digit', minute: '2-digit', hour12: true 
            });

            const newDoc: Document = {
              id: `doc-${Date.now()}-${Math.random()}`,
              name: file.name,
              type: activeTab === 'drive' ? 'Drive' : 'Registry Record',
              uploadDate: now.toISOString().split('T')[0],
              status: activeTab === 'drive' ? 'Verified' : 'Pending',
              statusHistory: [{ status: activeTab === 'drive' ? 'Verified' : 'Pending', timestamp }]
            };

            setEmployees(prev => prev.map(emp => 
              emp.id === user.id ? { ...emp, documents: [newDoc, ...(emp.documents || [])] } : emp
            ));
            setUploadQueue(prev => prev.filter(u => u.id !== uploadId));
            addNotification(user.id, activeTab === 'drive' ? "My Drive Deposit" : "Registry Deposit", `"${newDoc.name}" uploaded successfully.`);
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

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => { setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const toggleHistory = (docId: string) => { setExpandedDocId(expandedDocId === docId ? null : docId); };

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
      month: 'short', day: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
    const verifierIdentity = `${user.name} [HR Master]`;

    setEmployees(prev => prev.map(emp => {
      if (emp.id === ownerId) {
        const docName = emp.documents?.find(d => d.id === docId)?.name;
        addNotification(ownerId, "Record Verified", `HR has finalized verification for "${docName}".`);
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
      if (isHR || ownerId === user.id) {
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
            {isHR 
              ? activeTab === 'drive' ? 'Global User Drive' : 'Global Registry' 
              : activeTab === 'drive' ? 'My Secure Drive' : 'My Personnel File'
            }
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">
            {isHR 
              ? 'Administrative Audit: Oversee and verify organizational compliance documents.' 
              : activeTab === 'drive' 
                ? 'Personal Storage: Securely store and manage your essential documents.'
                : 'Professional Dossier: Manage your records and certifications.'}
          </p>
        </div>
        <div className="flex gap-3">
          {isHR && activeTab === 'payslips' ? (
            <button 
              onClick={() => setIsGeneratingPayslip(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-900/10 transition-all active:scale-95 text-xs uppercase tracking-widest"
            >
              <CreditCard size={16} />
              Release Payslip
            </button>
          ) : (
            <>
              <input type="file" id="file-upload" multiple className="hidden" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} />
              <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-900/10 transition-all active:scale-95 text-xs uppercase tracking-widest">
                <Upload size={16} /> {activeTab === 'drive' ? 'Upload to Drive' : 'Quick Upload'}
              </label>
            </>
          )}
        </div>
      </header>

      <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('general')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <Files size={16} /> General Records
        </button>
        <button onClick={() => setActiveTab('payslips')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'payslips' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <CreditCard size={16} /> Financial Payslips
        </button>
        <button onClick={() => setActiveTab('drive')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'drive' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <HardDrive size={16} /> My Drive
        </button>
      </div>

      {(activeTab === 'general' || activeTab === 'drive') ? (
        <>
          <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={`relative border-2 border-dashed rounded-[3rem] p-12 transition-all duration-500 text-center group ${isDragging ? 'bg-blue-50 border-blue-400 scale-[0.99] ring-4 ring-blue-900/5' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
            <div className="flex flex-col items-center">
              <div className={`p-6 rounded-[2rem] mb-6 transition-all duration-500 ${isDragging ? 'bg-blue-900 text-white shadow-xl rotate-12' : 'bg-blue-50 text-blue-900'}`}>
                {activeTab === 'drive' ? <FolderOpen size={40} /> : <Files size={40} />}
              </div>
              <h2 className="text-xl font-bold text-blue-900 mb-2">
                {activeTab === 'drive' ? 'Drop Files into My Drive' : 'Drop Personnel Records Here'}
              </h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                {activeTab === 'drive' ? 'Accepts PDF, XLSX, CSV, DOC' : 'Supports PDF, JPG, or PNG formats'}
              </p>
            </div>
          </div>

          {uploadQueue.length > 0 && (
            <div className="bg-white rounded-[2.5rem] border border-blue-100 p-8 shadow-sm animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-600" /> Transferring to {activeTab === 'drive' ? 'My Drive' : 'Registry'}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploadQueue.map(upload => (
                  <div key={upload.id} className="p-5 bg-gray-50/50 rounded-3xl border border-gray-100 relative group">
                    <button onClick={() => cancelUpload(upload.id)} className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"><X size={14} /></button>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-900 shrink-0"><FileUp size={24} /></div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-blue-900 truncate pr-4">{upload.name}</p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-white border border-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-900 transition-all duration-500" style={{ width: `${upload.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder={`Search ${activeTab === 'drive' ? 'drive' : 'registry'} by name...`} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-900/5 transition-all text-sm font-bold text-blue-900" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            {isHR && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 sm:w-64">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Filter by employee..." className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none focus:ring-4 focus:ring-blue-900/5 transition-all text-sm font-bold text-blue-900" value={personnelSearch} onChange={(e) => setPersonnelSearch(e.target.value)} />
                </div>
                {activeTab !== 'drive' && (
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="pl-12 pr-10 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm outline-none text-xs font-black uppercase tracking-widest appearance-none cursor-pointer text-blue-900">
                      <option value="All">All Statuses</option>
                      <option value="Verified">Verified Only</option>
                      <option value="Pending">Pending Audit</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'general' ? processedDocs : driveDocs).length === 0 ? (
              <div className="col-span-full py-24 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto shadow-inner"><FileSearch size={40} /></div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">Registry Search Complete: No matching records</p>
              </div>
            ) : (
              (activeTab === 'general' ? processedDocs : driveDocs).map(doc => (
                <div key={doc.id} className="flex flex-col h-fit">
                  <div className={`bg-white rounded-[2.5rem] border transition-all duration-300 shadow-sm hover:border-blue-200 overflow-hidden ${expandedDocId === doc.id ? 'ring-4 ring-blue-900/5 shadow-md' : 'border-gray-100'}`}>
                    <div className="p-8">
                      {isHR && (
                        <div className="mb-6 flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-[10px] font-black text-white">{doc.ownerName.charAt(0)}</div>
                            <div>
                              <p className="text-[10px] font-black text-blue-900 uppercase leading-none">{doc.ownerName}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-2xl ${doc.type === 'Relieving Letter' ? 'bg-blue-900 text-white shadow-lg' : doc.type === 'Drive' ? 'bg-indigo-50 text-indigo-900' : 'bg-blue-50 text-blue-900'}`}>
                          {doc.type === 'Relieving Letter' ? <Briefcase size={24} /> : doc.type === 'Drive' ? <HardDrive size={24} /> : <FileText size={24} />}
                        </div>
                        {activeTab !== 'drive' && (
                          <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${doc.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>{doc.status}</span>
                        )}
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
                          <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${doc.type === 'Relieving Letter' ? 'text-blue-600' : doc.type === 'Drive' ? 'text-indigo-400' : 'text-gray-400'}`}>{doc.type === 'Drive' ? 'Drive Personal Storage' : doc.type}</p>
                          {doc.verifiedBy && (
                            <div className="flex items-center gap-2.5 py-2.5 px-3.5 bg-green-50/50 border border-green-100 rounded-2xl mb-2">
                              <UserCheck size={14} className="text-green-600" />
                              <div className="min-w-0">
                                <p className="text-[8px] font-black text-green-700 uppercase tracking-widest">Registry Sign-off</p>
                                <p className="text-[10px] font-bold text-blue-900 truncate mt-0.5">{doc.verifiedBy}</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-4">
                        <button onClick={() => toggleHistory(doc.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${expandedDocId === doc.id ? 'bg-blue-900 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:text-blue-900 hover:bg-blue-50'}`}>
                          <History size={12} /> Audit Trail
                        </button>
                        <div className="flex gap-1">
                          {doc.type === 'Relieving Letter' && (
                            <button onClick={() => handleDownloadRelievingLetter(doc as any)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Download PDF"><Download size={18}/></button>
                          )}
                          {doc.type === 'Drive' && (
                            <button onClick={() => handleDownloadGeneric(doc)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Download File"><Download size={18}/></button>
                          )}
                          {isHR && doc.status !== 'Verified' && doc.type !== 'Drive' && (
                            <button onClick={() => verifyDoc(doc.id, doc.ownerId)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all" title="Verify Entry"><ShieldCheck size={18}/></button>
                          )}
                          {doc.ownerId === user.id && doc.type !== 'Relieving Letter' && (
                            <button onClick={() => startEditing(doc)} className="p-2 text-gray-300 hover:text-blue-900 transition-all" title="Manage Record"><Edit2 size={16} /></button>
                          )}
                          {(isHR || doc.ownerId === user.id) && (
                            <button onClick={() => setDocToDelete({ docId: doc.id, ownerId: doc.ownerId, name: doc.name })} className="p-2 text-gray-300 hover:text-red-500 transition-all" title="Purge Entry"><Trash2 size={16} /></button>
                          )}
                        </div>
                      </div>
                    </div>
                    {expandedDocId === doc.id && (
                      <div className="bg-gray-50 border-t border-gray-100 p-8 animate-in slide-in-from-top-4 duration-500">
                        <div className="space-y-8 relative ml-2">
                          <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-blue-100"></div>
                          {(doc.statusHistory || []).map((entry, idx) => (
                            <div key={idx} className="flex gap-6 relative z-10 animate-in slide-in-from-left-4 duration-500">
                              <div className={`w-5 h-5 rounded-full border-4 border-white shadow-md mt-0.5 flex-shrink-0 flex items-center justify-center ${entry.status === 'Verified' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                {entry.status === 'Verified' ? <ShieldCheck size={10} className="text-white" /> : <Clock size={10} className="text-white" />}
                              </div>
                              <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative">
                                <p className={`text-xs font-black uppercase tracking-widest ${entry.status === 'Verified' ? 'text-green-600' : 'text-yellow-600'}`}>{entry.status === 'Verified' ? 'Audit Verified' : 'Initial Entry'}</p>
                                <span className="text-[9px] font-black text-blue-900 uppercase tracking-tight">{entry.timestamp}</span>
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
        </>
      ) : (
        /* PAYSLIPS VIEW */
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="bg-slate-900 text-white rounded-[3rem] p-10 relative overflow-hidden group border border-slate-800 shadow-2xl">
            <div className="absolute top-0 right-0 p-10 text-white/5 pointer-events-none group-hover:text-blue-500/10 transition-all duration-1000">
              <CreditCard size={200} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg"><FileBadge size={20} /></div>
                  <h2 className="text-lg font-black uppercase tracking-widest">Financial Portal</h2>
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">
                  Official compensation registry. 
                  {!isHR && (
                    <span className="block mt-2 text-yellow-500 font-bold uppercase tracking-tight text-[10px] flex items-center gap-2">
                      <CalendarClock size={14} /> Organization Policy: Access strictly limited to current and last 2 payroll periods.
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="px-3 py-1 bg-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/30">Verified PDF Access</span>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><Download size={24} className="text-blue-400" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Items</p>
                  <p className="text-2xl font-black">{payslips.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {payslips.length === 0 ? (
              <div className="col-span-full py-24 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto shadow-inner"><CreditCard size={40} /></div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">No Statements Available in Active Window</p>
                {!isHR && <p className="text-gray-300 text-[10px] font-bold uppercase">Restricted to last 3 months</p>}
              </div>
            ) : (
              payslips.map(payslip => (
                <div key={payslip.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-xl transition-all group">
                   <div className="flex items-start justify-between mb-8">
                      <div className="p-4 bg-blue-50 text-blue-900 rounded-[1.5rem] group-hover:bg-blue-900 group-hover:text-white transition-all">
                        <FileText size={28} />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-green-100 mb-2">Registry PDF</span>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Entry Date: {payslip.uploadDate}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-1 mb-8">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{payslip.ownerName}</p>
                     <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight">Period: {payslip.name}</h3>
                   </div>

                   <button 
                    onClick={() => handleDownloadPayslip(payslip)}
                    className="w-full py-4 bg-gray-50 text-blue-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-900 hover:text-white transition-all active:scale-95 group-hover:shadow-lg group-hover:shadow-blue-900/10"
                   >
                     <Download size={16} /> Download PDF Statement
                   </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isGeneratingPayslip && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsGeneratingPayslip(false)}></div>
          <div className="relative bg-white rounded-[3.5rem] p-10 max-w-2xl w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-400 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-900 text-white rounded-3xl shadow-lg shadow-blue-900/20"><Banknote size={24} /></div>
                <div>
                  <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter leading-none">Release Payslip</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Financial Registry Control</p>
                </div>
              </div>
              <button onClick={() => setIsGeneratingPayslip(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleGeneratePayslip} className="space-y-8">
              {/* Personnel & Period */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Personnel</label>
                  <div className="relative group">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-900" size={18} />
                    <input type="text" required placeholder="Personnel ID" value={payslipFormData.employeeId} onChange={e => setPayslipFormData({...payslipFormData, employeeId: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:bg-white transition-all font-bold text-xs text-blue-900" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Period Month</label>
                  <select value={payslipFormData.month} onChange={e => setPayslipFormData({...payslipFormData, month: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl font-bold text-xs text-blue-900 outline-none">
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Period Year</label>
                  <select value={payslipFormData.year} onChange={e => setPayslipFormData({...payslipFormData, year: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl font-bold text-xs text-blue-900 outline-none">
                    {['2024', '2025', '2026'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Earnings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator size={16} className="text-green-600" />
                    <h3 className="text-[11px] font-black text-green-700 uppercase tracking-widest">Earnings Components</h3>
                  </div>
                  <div className="space-y-4 p-6 bg-green-50/30 rounded-[2rem] border border-green-100">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Basic Salary</label>
                      <input type="number" value={payslipFormData.basicSalary} onChange={e => setPayslipFormData({...payslipFormData, basicSalary: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl font-bold text-xs text-blue-900 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">HRA</label>
                      <input type="number" value={payslipFormData.hra} onChange={e => setPayslipFormData({...payslipFormData, hra: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl font-bold text-xs text-blue-900 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Conveyance</label>
                      <input type="number" value={payslipFormData.conveyance} onChange={e => setPayslipFormData({...payslipFormData, conveyance: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl font-bold text-xs text-blue-900 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Special Allowance</label>
                      <input type="number" value={payslipFormData.specialAllowance} onChange={e => setPayslipFormData({...payslipFormData, specialAllowance: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl font-bold text-xs text-blue-900 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt size={16} className="text-red-600" />
                    <h3 className="text-[11px] font-black text-red-700 uppercase tracking-widest">Deductions Components</h3>
                  </div>
                  <div className="space-y-4 p-6 bg-red-50/30 rounded-[2rem] border border-red-100">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Provident Fund (PF)</label>
                      <input type="number" value={payslipFormData.pf} onChange={e => setPayslipFormData({...payslipFormData, pf: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-red-100 rounded-xl font-bold text-xs text-blue-900 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Tax</label>
                      <input type="number" value={payslipFormData.professionalTax} onChange={e => setPayslipFormData({...payslipFormData, professionalTax: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-red-100 rounded-xl font-bold text-xs text-blue-900 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">TDS</label>
                      <input type="number" value={payslipFormData.tds} onChange={e => setPayslipFormData({...payslipFormData, tds: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-red-100 rounded-xl font-bold text-xs text-blue-900 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Other Deductions</label>
                      <input type="number" value={payslipFormData.otherDeductions} onChange={e => setPayslipFormData({...payslipFormData, otherDeductions: Number(e.target.value)})} className="w-full px-4 py-3 bg-white border border-red-100 rounded-xl font-bold text-xs text-blue-900 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900 text-white p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl shadow-blue-900/20">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Estimated Net Salary</p>
                  <p className="text-2xl font-black">INR {(payslipFormData.basicSalary + payslipFormData.hra + payslipFormData.conveyance + payslipFormData.specialAllowance - (payslipFormData.pf + payslipFormData.professionalTax + payslipFormData.tds + payslipFormData.otherDeductions)).toLocaleString('en-IN')}</p>
                </div>
                <button type="submit" className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-3">Commit & Release <ArrowRight size={18} /></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {docToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm" onClick={() => setDocToDelete(null)}></div>
          <div className="relative bg-white rounded-[3rem] p-10 max-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner"><TriangleAlert size={40} /></div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2 uppercase tracking-tighter">Purge Authorization</h2>
              <p className="text-sm text-gray-400 mb-10 font-bold uppercase tracking-widest leading-relaxed">Permanently erase this record from the organizational file?</p>
              <div className="w-full space-y-4 mb-10">
                <button onClick={() => setIsDeleteConfirmed(!isDeleteConfirmed)} className="flex items-start gap-3 text-left group transition-all">
                  <div className={`mt-0.5 shrink-0 transition-all ${isDeleteConfirmed ? 'text-red-600' : 'text-gray-300 group-hover:text-red-300'}`}>{isDeleteConfirmed ? <CheckSquare size={20} /> : <Square size={20} />}</div>
                  <span className={`text-[11px] font-bold uppercase tracking-tight leading-snug transition-all ${isDeleteConfirmed ? 'text-red-700' : 'text-gray-400'}`}>I authorize this irreversible action and acknowledge all audit history will be deleted.</span>
                </button>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button onClick={finalizeDelete} disabled={!isDeleteConfirmed} className={`w-full py-5 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isDeleteConfirmed ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>Authorize Purge</button>
                <button onClick={() => setDocToDelete(null)} className="w-full py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Abort</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
