
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { User, UserRole, AttendanceRecord } from '../types';
import { db } from '../services/db';

const data = [
  { name: 'Mon', count: 42 },
  { name: 'Tue', count: 45 },
  { name: 'Wed', count: 39 },
  { name: 'Thu', count: 48 },
  { name: 'Fri', count: 41 },
];

const trendData = [
  { name: 'Week 1', hours: 38 },
  { name: 'Week 2', hours: 42 },
  { name: 'Week 3', hours: 40 },
  { name: 'Week 4', hours: 44 },
];

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const attendance = useMemo(() => db.getAttendance(user.id), [user.id]);
  const leaves = useMemo(() => db.getLeaves(user.id), [user.id]);
  
  // Aggregate data for Managers/Admins
  const allUsers = useMemo(() => db.getUsers(), []);
  const allAttendance = useMemo(() => db.getAttendance(), []);
  const today = new Date().toISOString().split('T')[0];
  const presentToday = allAttendance.filter(a => a.date === today && a.clockIn && !a.clockOut);
  
  const isPrivileged = user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;

  const stats = [
    { label: isPrivileged ? 'Staff Present' : 'Days Present', value: isPrivileged ? presentToday.length : attendance.filter(a => a.status === 'PRESENT').length, icon: '✅', color: 'blue' },
    { label: isPrivileged ? 'Total Workforce' : 'Pending Leaves', value: isPrivileged ? allUsers.length : leaves.filter(l => l.status === 'PENDING').length, icon: isPrivileged ? '👥' : '🕒', color: 'amber' },
    { label: 'Leave Balance', value: '12', icon: '🏖️', color: 'emerald' },
    { label: 'Monthly Hours', value: '168', icon: '⏱️', color: 'indigo' },
  ];

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, {user.name}</h1>
          <p className="text-slate-500 font-medium">{isPrivileged ? `Managing ${user.department} Operations` : "Here's your attendance summary for this month."}</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live System Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-default">
            <div className="flex items-center justify-between mb-4">
              <span className={`p-3 bg-slate-50 text-2xl rounded-2xl group-hover:scale-110 transition-transform`}>{stat.icon}</span>
              <span className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">Overview</span>
            </div>
            <div className="text-4xl font-black text-slate-900 mb-1">{stat.value}</div>
            <div className="text-sm font-bold text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black mb-8 text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              Workforce Velocity
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }} />
                  <Area type="monotone" dataKey="hours" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHours)" strokeWidth={4} dot={{r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff'}} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Status Sidebar for Privileged Users */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-lg font-black mb-6 text-slate-800 flex items-center justify-between">
            <span>{isPrivileged ? "Live Activity" : "Recent Logs"}</span>
            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-lg uppercase tracking-tighter">Real-time</span>
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {(isPrivileged ? presentToday : attendance.slice(0, 5)).map((item, idx) => {
              const u = allUsers.find(usr => usr.id === (isPrivileged ? item.userId : user.id));
              return (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:border-blue-200">
                  <img src={u?.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{u?.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{isPrivileged ? u?.department : new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600">IN</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {item.clockIn ? new Date(item.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                    </p>
                  </div>
                </div>
              );
            })}
            {isPrivileged && presentToday.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-300 text-sm font-bold italic">No active sessions currently.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
