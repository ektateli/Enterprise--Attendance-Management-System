
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { db } from '../services/db';
import { User, AttendanceRecord, LeaveRequest, UserRole } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Reports: React.FC = () => {
  // Fix: db calls return promises; using state to store fetched data
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);

  // Fix: Handle async fetching inside useEffect
  useEffect(() => {
    const load = async () => {
      const [att, usr, lve] = await Promise.all([
        db.getAttendance(),
        db.getUsers(),
        db.getLeaves()
      ]);
      setAllAttendance(att);
      setAllUsers(usr);
      setAllLeaves(lve);
    };
    load();
  }, []);

  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    allUsers.forEach(u => {
      counts[u.department] = (counts[u.department] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allUsers]);

  const leaveData = useMemo(() => {
    const counts: Record<string, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    allLeaves.forEach(l => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allLeaves]);

  const stats = [
    { label: 'Avg. Working Hours', value: '7.8h', change: '+12%', color: 'blue' },
    { label: 'Attendance Rate', value: '94.2%', change: '+2.4%', color: 'emerald' },
    { label: 'Monthly Overtime', value: '14.5h', change: '-5%', color: 'amber' },
    { label: 'Active Employees', value: allUsers.length, change: 'Stable', color: 'indigo' },
  ];

  const handleExport = () => {
    alert("Exporting enterprise attendance data to CSV... Check your downloads folder (Simulated)");
  };

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Enterprise Reports</h1>
          <p className="text-slate-500">Comprehensive workforce analytics and operational data.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          📥 Export Data (CSV)
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
              <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-8 text-slate-800">Workforce by Department</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-8 text-slate-800">Leave Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leaveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-4xl">📊</div>
          <h4 className="text-xl font-bold text-slate-800">Advanced Analytics Available</h4>
          <p className="text-slate-500">Connect your PowerBI or Tableau instance to unlock real-time streaming analytics for your global workspace.</p>
          <button className="text-blue-600 font-bold hover:underline">Learn more about API integrations</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
