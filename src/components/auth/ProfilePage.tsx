import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useApp } from '../../store/AppContext';
import { AVATAR_COLORS } from '../../types';
import { hashPassword } from '../../utils/auth';
import { getInitials } from '../../utils/auth';

export default function ProfilePage() {
  const { currentUser, updateUser } = useAuth();
  const { dispatch } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatarColor, setAvatarColor] = useState(currentUser?.avatarColor || AVATAR_COLORS[0]);
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  if (!currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }

    const updated = { ...currentUser, name: name.trim(), email: email.trim().toLowerCase(), avatarColor };
    if (newPassword) {
      if (newPassword.length < 4) { setError('Password must be at least 4 characters'); return; }
      updated.passwordHash = await hashPassword(newPassword);
    }
    updateUser(updated);
    setSaved(true);
    setNewPassword('');
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = "w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 transition-all";

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-xl mx-auto">
        <button onClick={() => dispatch({ type: 'SET_VIEW', view: 'pipeline' })} className="text-text-tertiary hover:text-text-primary text-sm mb-4 transition-colors">
          ← Back
        </button>
        <h2 className="text-xl font-bold text-text-primary mb-6">My Profile</h2>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: avatarColor }}>
            {getInitials(name || currentUser.name)}
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">{name || currentUser.name}</p>
            <p className="text-sm text-text-secondary">{currentUser.role}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-surface-1 border border-border rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Full Name</label>
            <input className={inputClass} value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
            <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Role</label>
            <input className={inputClass} value={currentUser.role} disabled />
            <p className="text-[10px] text-text-tertiary mt-1">Role can only be changed by an Admin</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Avatar Color</label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${avatarColor === c ? 'ring-2 ring-gray-900 ring-offset-2 ring-offset-white scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">New Password (leave blank to keep current)</label>
            <input className={inputClass} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-lg transition-all">
              Save Changes
            </button>
            {saved && <span className="text-sm text-success animate-fadeIn">✓ Saved</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
