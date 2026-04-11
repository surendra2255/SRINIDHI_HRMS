
import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Send, 
  User, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Smile,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react';
import { InternalMessage, User as UserType, Employee } from '../types';

interface MessagesProps {
  user: UserType;
  messages: InternalMessage[];
  setMessages: React.Dispatch<React.SetStateAction<InternalMessage[]>>;
  employees: Employee[];
}

const Messages: React.FC<MessagesProps> = ({ user, messages, setMessages, employees }) => {
  const [selectedContact, setSelectedContact] = useState<Employee | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = employees.filter(e => 
    e.id !== user.id && 
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const msg: InternalMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      receiverId: selectedContact.id,
      receiverName: selectedContact.name,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  const activeChatMessages = messages.filter(m => 
    (m.senderId === user.id && m.receiverId === selectedContact?.id) ||
    (m.senderId === selectedContact?.id && m.receiverId === user.id)
  );

  return (
    <div className="h-[calc(100vh-12rem)] bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex animate-in fade-in duration-500">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-50 flex flex-col">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-all border-l-4 ${
                selectedContact?.id === contact.id ? 'bg-blue-50 border-blue-900' : 'border-transparent'
              }`}
            >
              <div className="relative">
                <img 
                  src={contact.avatar} 
                  alt={contact.name} 
                  className="w-12 h-12 rounded-2xl object-cover shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  contact.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{contact.name}</p>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">12:45 PM</span>
                </div>
                <p className="text-[10px] font-medium text-gray-500 truncate uppercase tracking-tight">{contact.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-6 bg-white border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedContact.avatar} 
                  alt={selectedContact.name} 
                  className="w-10 h-10 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">{selectedContact.name}</h3>
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:bg-gray-50 hover:text-blue-900 rounded-xl transition-all"><Phone size={18} /></button>
                <button className="p-2 text-gray-400 hover:bg-gray-50 hover:text-blue-900 rounded-xl transition-all"><Video size={18} /></button>
                <button className="p-2 text-gray-400 hover:bg-gray-50 hover:text-blue-900 rounded-xl transition-all"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {activeChatMessages.length > 0 ? activeChatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] space-y-1 ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-[2rem] text-sm font-medium shadow-sm ${
                      msg.senderId === user.id 
                        ? 'bg-blue-900 text-white rounded-tr-none' 
                        : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                    }`}>
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-2 px-2">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">{msg.timestamp}</span>
                      {msg.senderId === user.id && (
                        <CheckCheck size={12} className="text-blue-400" />
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-sm">
                    <MessageSquare size={32} />
                  </div>
                  <div>
                    <p className="text-blue-900 font-black uppercase tracking-widest text-xs">Start a conversation</p>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">Say hello to {selectedContact.name}!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-6 bg-white border-t border-gray-50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <button type="button" className="p-2 text-gray-400 hover:text-blue-900 transition-all"><Paperclip size={20} /></button>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Type your message here..." 
                    className="w-full pl-6 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-900/10 transition-all outline-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-900 transition-all">
                    <Smile size={20} />
                  </button>
                </div>
                <button 
                  type="submit"
                  className="p-4 bg-blue-900 text-white rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all active:scale-95"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-gray-200 shadow-sm border border-gray-50">
              <MessageSquare size={48} />
            </div>
            <div>
              <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight">Select a Contact</h3>
              <p className="text-gray-400 font-medium max-w-xs mx-auto">Choose an employee from the sidebar to start messaging securely.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
