
import React from 'react';
import { User, UserRole } from '../types';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
    { id: 'attendance', label: 'My Attendance', icon: '⏰', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
    { id: 'leaves', label: 'Leave Requests', icon: '📅', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE] },
    { id: 'admin', label: 'Admin Panel', icon: '🛡️', roles: [UserRole.ADMIN] },
    { id: 'reports', label: 'Reports', icon: '📈', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">C</div>
        <h1 className="text-xl font-bold tracking-tight">ChronoFlow</h1>
      </div>
      
      <div className="flex-1 py-6">
        <nav className="space-y-1 px-4">
          {navItems.filter(item => item.roles.includes(currentUser.role)).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-xl mb-4">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-slate-700" />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-400 truncate">{currentUser.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full py-2 px-4 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
