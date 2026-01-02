
import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord } from '../types';
import { db } from '../services/db';

const Attendance: React.FC<{ user: User }> = ({ user }) => {
  const [time, setTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | undefined>();
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    setTodayRecord(db.getTodayRecord(user.id));
    setHistory(db.getAttendance(user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    return () => clearInterval(timer);
  }, [user.id]);

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
    setHistory(db.getAttendance(user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-slate-400 font-medium mb-1">Current Time</p>
          <h2 className="text-5xl font-mono font-bold">{time.toLocaleTimeString()}</h2>
          <p className="text-slate-500 mt-2 font-medium">{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="flex gap-4 relative z-10">
          {!todayRecord?.clockIn ? (
            <button 
              onClick={handleClockIn}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30"
            >
              Clock In Now
            </button>
          ) : !todayRecord?.clockOut ? (
            <button 
              onClick={handleClockOut}
              className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30"
            >
              Clock Out Now
            </button>
          ) : (
            <div className="bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
              <span>✅</span> Daily Shift Completed
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-lg">Attendance History</h3>
          <span className="text-sm font-medium text-slate-500 px-3 py-1 bg-slate-200 rounded-full">{history.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Clock In</th>
                <th className="px-6 py-4">Clock Out</th>
                <th className="px-6 py-4">Total Hours</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((record) => {
                const clockIn = record.clockIn ? new Date(record.clockIn) : null;
                const clockOut = record.clockOut ? new Date(record.clockOut) : null;
                const hours = clockIn && clockOut ? ((clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)).toFixed(2) : '--';
                
                return (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{record.date}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{clockIn?.toLocaleTimeString() || '-'}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{clockOut?.toLocaleTimeString() || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{hours}h</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No attendance records found. Clock in to start your journey!
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
