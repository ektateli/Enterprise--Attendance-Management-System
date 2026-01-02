
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, LeaveRequest } from '../types';
import { db } from '../services/db';

const LeaveRequests: React.FC<{ user: User }> = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Form states
  const [type, setType] = useState<LeaveRequest['type']>('VACATION');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Fix: refreshData is now an async function
  const refreshData = async () => {
    const data = user.role === UserRole.EMPLOYEE ? await db.getLeaves(user.id) : await db.getLeaves();
    setRequests(data);
  };

  // Fix: Handle initial async data fetching in useEffect
  useEffect(() => {
    refreshData();
    const fetchUsers = async () => {
      const u = await db.getUsers();
      setUsers(u);
    };
    fetchUsers();
  }, [user.id, user.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: LeaveRequest = {
      id: `lr-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      type,
      startDate,
      endDate,
      status: 'PENDING',
      reason
    };
    await db.saveLeave(newRequest);
    setIsModalOpen(false);
    await refreshData();
    // Reset form
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const handleAction = async (id: string, status: LeaveRequest['status']) => {
    await db.updateLeaveStatus(id, status);
    await refreshData();
  };

  // Fix: usersMap now depends on users state which is fetched asynchronously
  const usersMap = useMemo(() => {
    const m = new Map();
    users.forEach(u => m.set(u.id, u));
    return m;
  }, [users]);

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-slate-500">Submit and track time-off requests.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
        >
          + New Leave Request
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 font-bold text-slate-800 bg-slate-50/50">
          {user.role === UserRole.EMPLOYEE ? 'My Requests' : 'Pending Approvals'}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.sort((a,b) => b.startDate.localeCompare(a.startDate)).map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={usersMap.get(req.userId)?.avatar} alt="" className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-bold text-slate-800">{usersMap.get(req.userId)?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{usersMap.get(req.userId)?.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase tracking-tighter">
                      {req.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700">{req.startDate} to {req.endDate}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{req.reason}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== UserRole.EMPLOYEE && req.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(req.id, 'APPROVED')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          Check
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'REJECTED')}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg relative z-10 shadow-2xl animate-scaleIn">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Request Time Off</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Leave Type</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="VACATION">Vacation</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PERSONAL">Personal Time</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">End Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reason (Optional)</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all h-24 resize-none"
                  placeholder="Tell us why you need time off..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-blue-600 shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
