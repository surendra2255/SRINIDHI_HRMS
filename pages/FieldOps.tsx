
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Camera, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Navigation, 
  WifiOff, 
  CloudUpload,
  Search,
  ChevronRight,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { FieldVisit, User } from '../types';

interface FieldOpsProps {
  user: User;
  addNotification: (userId: string, title: string, message: string) => void;
}

const MOCK_VISITS: FieldVisit[] = [
  {
    id: 'VIS-001',
    caseId: 'REC-001',
    officerId: 'emp-alice',
    timestamp: '2024-05-16 10:30',
    location: { lat: 12.9716, lng: 77.5946, address: 'MG Road, Bangalore' },
    status: 'Customer Met',
    notes: 'Customer agreed to pay partial amount by tomorrow.',
    photoUrl: 'https://picsum.photos/seed/visit1/400/300'
  },
  {
    id: 'VIS-002',
    caseId: 'REC-002',
    officerId: 'emp-alice',
    timestamp: '2024-05-16 11:45',
    location: { lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bangalore' },
    status: 'Door Locked',
    notes: 'House was locked. Neighbor said they are out of town.',
    offline: true
  }
];

const FieldOps: React.FC<FieldOpsProps> = ({ user, addNotification }) => {
  const [visits, setVisits] = useState<FieldVisit[]>(MOCK_VISITS);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showCapture, setShowCapture] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter serif">Field Operations</h1>
          <p className="text-gray-500 font-medium">Real-time field tracking, status updates, and evidence capture.</p>
        </div>
        <div className="flex items-center gap-3">
          {isOffline && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-200">
              <WifiOff size={14} /> Offline Mode Active
            </div>
          )}
          <button 
            onClick={() => setShowCapture(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20"
          >
            <Camera size={20} /> Log Visit
          </button>
        </div>
      </div>

      {/* Field Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-2xl font-black text-blue-900">08</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visits Today</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-2xl font-black text-green-600">05</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Successful Meets</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-2xl font-black text-blue-900">12.4km</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distance Covered</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-2xl font-black text-orange-600">{visits.filter(v => v.offline).length}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Sync</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visit History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Recent Activity</h2>
          {visits.map(visit => (
            <div key={visit.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">{visit.status}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{visit.location.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{visit.timestamp}</p>
                  {visit.offline && (
                    <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase tracking-widest border border-orange-100">Offline Log</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-6 italic">"{visit.notes}"</p>

              {visit.photoUrl && (
                <div className="relative w-full h-48 rounded-3xl overflow-hidden mb-6 group">
                  <img src={visit.photoUrl} alt="Visit Evidence" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white"><ImageIcon size={24} /></button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-900 uppercase">
                  <Navigation size={12} /> {visit.location.lat.toFixed(4)}, {visit.location.lng.toFixed(4)}
                </div>
                <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-900 transition-all">View Case Details</button>
              </div>
            </div>
          ))}
        </div>

        {/* Active Map / Location Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Navigation size={40} className="animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-blue-900 uppercase tracking-tight mb-2">Live Tracking</h3>
            <p className="text-xs text-gray-500 mb-6">Your location is being securely shared with the central command center.</p>
            {currentLocation && (
              <div className="p-4 bg-gray-50 rounded-2xl text-left space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Latitude</span>
                  <span className="text-blue-900">{currentLocation.lat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>Longitude</span>
                  <span className="text-blue-900">{currentLocation.lng.toFixed(6)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Assigned Route</h3>
            <div className="space-y-6">
              {[
                { label: 'MG Road Office', time: '10:00 AM', status: 'Completed' },
                { label: 'Koramangala Residency', time: '11:30 AM', status: 'Completed' },
                { label: 'Indiranagar Plaza', time: '02:00 PM', status: 'Pending' },
                { label: 'Whitefield Towers', time: '04:30 PM', status: 'Pending' },
              ].map((stop, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  {i < 3 && <div className="absolute left-2 top-6 bottom-0 w-[1px] bg-gray-100"></div>}
                  <div className={`w-4 h-4 rounded-full mt-1 shrink-0 border-2 ${stop.status === 'Completed' ? 'bg-green-500 border-green-200' : 'bg-white border-gray-200'}`}></div>
                  <div>
                    <p className={`text-xs font-bold ${stop.status === 'Completed' ? 'text-gray-400 line-through' : 'text-blue-900'}`}>{stop.label}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{stop.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Log Visit Modal (Simplified) */}
      {showCapture && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-blue-900/20 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Log Field Visit</h2>
              <button onClick={() => setShowCapture(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={20}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Evidence Photo</label>
                <div className="w-full h-48 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-100 transition-all">
                  <Camera size={32} className="text-gray-300" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tap to Capture</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visit Status</label>
                <select className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-xs text-blue-900 outline-none">
                  <option>Customer Met</option>
                  <option>Door Locked</option>
                  <option>Refused to Meet</option>
                  <option>Address Not Found</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Field Notes</label>
                <textarea className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl font-bold text-xs text-blue-900 outline-none h-32 resize-none" placeholder="Enter detailed observations..."></textarea>
              </div>

              <button className="w-full py-5 bg-blue-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3">
                <CloudUpload size={20} /> Submit Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldOps;
