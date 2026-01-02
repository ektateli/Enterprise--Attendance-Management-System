
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, AttendanceRecord } from '../types';
import { db } from '../services/db';

const Attendance: React.FC<{ user: User }> = ({ user }) => {
  const [time, setTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | undefined>();
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [viewMode, setViewMode] = useState<'PERSONAL' | 'WORKFORCE'>('PERSONAL');
  const [searchQuery, setSearchQuery] = useState('');

  const isPrivileged = user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
  const allUsers = useMemo(() => db.getUsers(), []);
  const usersMap = useMemo(() => {
    const map = new Map();
    allUsers.forEach(u => map.set(u.id, u));
    return map;
  }, [allUsers]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    setTodayRecord(db.getTodayRecord(user.id));
    refreshHistory();
    return () => clearInterval(timer);
  }, [user.id, viewMode]);

  const handleClockIn = () => {
    const record: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      date: new Date().toISOString().split('T')[0],
      clockIn: new Date().toISOString(),
      clockOut: null,
      status: 'PRESENT'
    };
    db.saveAttendance(record);
    setTodayRecord(record);
    refreshHistory();
  };

  const handleClockOut = () => {
    if (!todayRecord) return;
    const updated = { ...todayRecord, clockOut: new Date().toISOString() };
    db.saveAttendance(updated);
    setTodayRecord(updated);
    refreshHistory();
  };

  const refreshHistory = () => {
    const data = viewMode === 'PERSONAL' 
      ? db.getAttendance(user.id) 
      : db.getAttendance();
    
    setHistory(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const filteredHistory = history.filter(h => {
    if (!searchQuery) return true;
    const u = usersMap.get(h.userId);
    return u?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           u?.department.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-fadeIn">
      {/* Hero Clock-In Section */}
      <div className="bg-slate-950 text-white rounded-[3rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -mr-48 -mt-48 blur-[100px]"></div>
        <div className="relative z-10 text-center lg:text-left">
          <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Precision Timekeeping</p>
          <h2 className="text-7xl font-mono font-black tracking-tighter mb-2 italic">
            {time.toLocaleTimeString([], { hour12: false })}
          </h2>
          <p className="text-slate-400 mt-2 font-bold text-lg">
            {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-col gap-4 relative z-10 min-w-[300px]">
          {!todayRecord?.clockIn ? (
            <button 
              onClick={handleClockIn}
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-6 rounded-[2rem] font-black text-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3"
            >
              🚀 Clock In Now
            </button>
          ) : !todayRecord?.clockOut ? (
            <button 
              onClick={handleClockOut}
              className="bg-rose-600 hover:bg-rose-500 text-white px-10 py-6 rounded-[2rem] font-black text-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-rose-600/40 flex items-center justify-center gap-3"
            >
              🛑 Clock Out Now
            </button>
          ) : (
            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-10 py-6 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 backdrop-blur-sm">
              <span className="text-2xl">🏁</span> Shift Finalized
            </div>
          )}
          {todayRecord?.clockIn && (
            <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Shift Started: {new Date(todayRecord.clockIn).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* History Controls */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
          <div className="flex flex-col gap-1">
            <h3 className="font-black text-slate-900 text-2xl tracking-tight italic">Activity Ledger</h3>
            <p className="text-slate-500 text-sm font-medium">Enterprise clock-in auditing system.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-inner">
            <button 
              onClick={() => { setViewMode('PERSONAL'); setSearchQuery(''); }}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'PERSONAL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Personal
            </button>
            {isPrivileged && (
              <button 
                onClick={() => setViewMode('WORKFORCE')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'WORKFORCE' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Workforce
              </button>
            )}
          </div>
        </div>

        {viewMode === 'WORKFORCE' && (
          <div className="p-6 bg-slate-50 border-b border-slate-100">
            <input 
              type="text"
              placeholder="Filter by name or department..."
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none transition-all font-bold text-slate-700 bg-white shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                {viewMode === 'WORKFORCE' && <th className="px-8 py-5">Employee</th>}
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Clock In</th>
                <th className="px-8 py-5">Clock Out</th>
                <th className="px-8 py-5">Duration</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((record) => {
                const clockIn = record.clockIn ? new Date(record.clockIn) : null;
                const clockOut = record.clockOut ? new Date(record.clockOut) : null;
                const hours = clockIn && clockOut ? ((clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)).toFixed(2) : '--';
                const u = usersMap.get(record.userId);
                
                return (
                  <tr key={record.id} className="group hover:bg-slate-50/80 transition-all duration-200">
                    {viewMode === 'WORKFORCE' && (
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <img src={u?.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-black text-slate-900 text-sm">{u?.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{u?.department}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-8 py-5 font-bold text-slate-700">{new Date(record.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</td>
                    <td className="px-8 py-5 text-slate-600 font-mono text-sm">{clockIn?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) || '-'}</td>
                    <td className="px-8 py-5 text-slate-600 font-mono text-sm">{clockOut?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) || '-'}</td>
                    <td className="px-8 py-5 font-black text-slate-900">{hours}h</td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        record.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={viewMode === 'WORKFORCE' ? 6 : 5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-4xl grayscale opacity-50">📂</div>
                      <p className="text-slate-400 font-bold italic">No attendance records discovered for this context.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
