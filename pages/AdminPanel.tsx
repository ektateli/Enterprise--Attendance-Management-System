
import React, { useMemo } from 'react';
import { db } from '../services/db';
import { UserRole } from '../types';

const AdminPanel: React.FC = () => {
  const users = useMemo(() => db.getUsers(), []);
  const allAttendance = useMemo(() => db.getAttendance(), []);

  const stats = [
    { label: 'Total Staff', count: users.length, icon: '👥' },
    { label: 'Present Today', count: allAttendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length, icon: '📍' },
    { label: 'Pending Leaves', count: db.getLeaves().filter(l => l.status === 'PENDING').length, icon: '⏳' },
  ];

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Administrator Command Center</h1>
          <p className="text-slate-500">Manage your workforce, permissions, and enterprise settings.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
          + Add New Employee
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-bold text-slate-900">{s.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Employee Roster</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search employees..." 
              className="bg-slate-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-bold text-slate-800">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{u.department}</td>
                <td className="px-6 py-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block mr-2"></span>
                  <span className="text-sm font-medium text-slate-700">Active</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-blue-600 font-medium text-sm">Edit</button>
                  <span className="mx-2 text-slate-200">|</span>
                  <button className="text-slate-400 hover:text-red-600 font-medium text-sm">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
