
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { db } from './services/db';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import AdminPanel from './pages/AdminPanel';
import LeaveRequests from './pages/LeaveRequests';
import Reports from './pages/Reports';

const Auth: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    setTimeout(() => {
      if (isLogin) {
        const user = db.authenticate(email);
        // Simple simulation: any password works for demo if user exists
        if (user) {
          onLogin(user);
        } else {
          setError('Invalid email or password. Please check your credentials.');
          setIsSubmitting(false);
        }
      } else {
        const result = db.registerUser({
          name,
          email,
          role,
          department
        });

        if (typeof result === 'string') {
          setError(result);
          setIsSubmitting(false);
        } else {
          // Success Path: Redirect to Login as per user request
          setSuccess('Account created successfully! Please sign in with your credentials.');
          setIsLogin(true);
          setIsSubmitting(false);
          // Optional: Clear or keep email for convenience
          // setEmail(result.email);
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic background effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative z-10 border border-slate-200">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl mx-auto flex items-center justify-center text-white text-4xl font-black mb-6 shadow-2xl shadow-blue-500/40 rotate-3">C</div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">ChronoFlow</h2>
          <p className="text-slate-500 font-medium">Enterprise Access Protocol</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button 
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${isLogin ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${!isLogin ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Join Organization
          </button>
        </div>

        {success && (
          <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-xs font-bold border border-emerald-100 flex items-center gap-3 animate-bounce">
            <span className="text-lg">✨</span> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="animate-fadeIn">
              <div className="mb-5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alexander Pierce"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-300 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Account Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all text-sm font-bold bg-white"
                  >
                    <option value={UserRole.EMPLOYEE}>Employee</option>
                    <option value={UserRole.MANAGER}>Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Dept</label>
                  <select 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all text-sm font-bold bg-white"
                  >
                    <option value="Engineering">Eng</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Corporate Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="id@chronoflow.com"
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-300 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all"
            />
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[11px] font-black border border-rose-100 flex items-center gap-2">
              <span className="text-base">🚫</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4.5 rounded-2xl font-black text-white shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
              isSubmitting ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-blue-600 shadow-blue-900/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : isLogin ? 'Authenticate' : 'Initiate Registration'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Core Administrator Access</p>
          <button 
            type="button"
            onClick={() => { setEmail('admin@chronoflow.com'); setIsLogin(true); setError(''); setSuccess(''); }}
            className="group relative flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-all px-4 py-2 rounded-full hover:bg-blue-50"
          >
            <span className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-500 animate-pulse"></span>
            Master Admin Node
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(db.getCurrentUser());
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (u: User) => {
    db.setCurrentUser(u);
    setUser(u);
  };

  const handleLogout = () => {
    db.setCurrentUser(null);
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      <Sidebar 
        currentUser={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 ml-64 min-h-screen relative overflow-y-auto">
        <div className="max-w-7xl mx-auto pb-20">
          {activeTab === 'dashboard' && <Dashboard user={user} />}
          {activeTab === 'attendance' && <Attendance user={user} />}
          {activeTab === 'leaves' && <LeaveRequests user={user} />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'admin' && user.role === UserRole.ADMIN && <AdminPanel />}
        </div>
      </main>
    </div>
  );
};

export default App;
