import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import type { UserRole } from '../../types';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Sales Rep');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'register') {
      if (password.length < 4) { setError('Password must be at least 4 characters'); setLoading(false); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
      if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
      const err = await register(name.trim(), email.trim(), password, role);
      if (err) setError(err);
    } else {
      const err = await login(email.trim(), password, remember);
      if (err) setError(err);
    }
    setLoading(false);
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25 transition-all";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scaleIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
            <img src="/logo.png" alt="ClawTrack" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ClawTrack</h1>
          <p className="text-sm text-gray-400 mt-1">CRM Pipeline Manager</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-[#DC2626] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >Sign In</button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${mode === 'register' ? 'bg-[#DC2626] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >Register</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
                <input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
              <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <input className={inputClass} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm Password</label>
                  <input className={inputClass} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Role</label>
                  <select className={inputClass} value={role} onChange={e => setRole(e.target.value as UserRole)}>
                    <option value="Sales Rep">Sales Rep</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            {mode === 'login' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 bg-gray-50 text-red-600 focus:ring-red-500/25" />
                <span className="text-xs text-gray-500">Remember me</span>
              </label>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 animate-fadeIn">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-red-500/20 disabled:opacity-50"
            >
              {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-6">
          Local-only authentication · Data stored in your browser
        </p>
      </div>
    </div>
  );
}
