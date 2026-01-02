
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { User, AttendanceRecord } from '../types';
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

  const stats = [
    { label: 'Days Present', value: attendance.filter(a => a.status === 'PRESENT').length, icon: '✅', color: 'blue' },
    { label: 'Pending Leaves', value: leaves.filter(l => l.status === 'PENDING').length, icon: '🕒', color: 'amber' },
    { label: 'Leave Balance', value: '12', icon: '🏖️', color: 'emerald' },
    { label: 'Monthly Hours', value: '168', icon: '⏱️', color: 'indigo' },
  ];

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}</h1>
        <p className="text-slate-500">Here's what's happening with your attendance this month.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg text-2xl`}>{stat.icon}</span>
              <span className="text-xs font-bold text-slate-400 tracking-wider">THIS MONTH</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm font-medium text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Weekly Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Working Hours Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHours)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
