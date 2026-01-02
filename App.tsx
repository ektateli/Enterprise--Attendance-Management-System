
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { db } from './services/db';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import AdminPanel from './pages/AdminPanel';
import LeaveRequests from './pages/LeaveRequests';
import Reports from './pages/Reports';

const Auth: React.FC<{ onLogin: (user: User, token: string) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (isLogin) {
      const result = await db.authenticate(email);
      if (result) {
        onLogin(result.user, result.token);
      } else {
        setError('Authentication failed. Check your credentials.');
        setIsSubmitting(false);
      }
    } else {
      const result = await db.registerUser({ name, email, role, department });
      if (typeof result === 'string') {
        setError(result);
        setIsSubmitting(false);
      } else {
        setSuccess('Account created! Sign in to proceed.');
        setIsLogin(true);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-900/40 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-900/40 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative z-10 border border-slate-200">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-black mb-6 shadow-xl rotate-3">C</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">ChronoFlow</h2>
          <p className="text-slate-500 text-sm font-medium">Enterprise Access Protocol</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}>Sign In</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}>Register</button>
        </div>

        {success && <div className="mb-4 bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-xs font-bold border border-emerald-100">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 focus:border-blue-600 focus:outline-none font-semibold" />
          )}
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 focus:border-blue-600 focus:outline-none font-semibold" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 focus:border-blue-600 focus:outline-none font-semibold" />
          
          {error && <div className="text-rose-500 text-xs font-bold px-2">{error}</div>}

          <button type="submit" disabled={isSubmitting} className="w-full py-4.5 rounded-2xl font-black text-white bg-slate-900 hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
            {isSubmitting ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Register')}
          </button>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(db.getCurrentUser());
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (u: User, token: string) => {
    db.setCurrentUser(u, token);
    setUser(u);
  };

  const handleLogout = () => {
    db.setCurrentUser(null);
    setUser(null);
  };

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentUser={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 ml-64 min-h-screen">
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
