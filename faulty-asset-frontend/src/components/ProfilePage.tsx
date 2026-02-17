import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  changeDisplayName,
  getDisplayUser,
  getToken,
  getUserRoles,
} from '../services/auth';

type ProfilePageProps = {
  onProfileUpdated?: () => void;
};

function ProfilePage({ onProfileUpdated }: ProfilePageProps) {
  const initialUser = getDisplayUser();
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [newName, setNewName] = useState(initialUser);
  const [saving, setSaving] = useState(false);

  const roles = getUserRoles();
  const token = getToken();

  const initials = currentUser
    ? currentUser
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '??';

  const handleChangeName = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = newName.trim();
    if (!trimmedName) {
      toast.error('Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await changeDisplayName(trimmedName);
      setCurrentUser(trimmedName);
      setNewName(trimmedName);
      toast.success('Name has been changed successfully.');
      onProfileUpdated?.();
    } catch (error: any) {
      const data = error.response?.data;
      const message = Array.isArray(data)
        ? data.join(', ')
        : data?.title || data?.message || data || 'Failed to update name.';
      toast.error(String(message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">User Profile</h2>
        <p className="text-gray-400 text-sm">
          Manage your account details and permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-2xl flex flex-col items-center text-center backdrop-blur-sm">
            <div className="w-24 h-24 bg-emerald-600/20 border-2 border-secondary rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl font-black text-secondary">
                {initials}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {currentUser || 'Unknown User'}
            </h3>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {roles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded-full"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-neutral-800">
              <h4 className="font-bold text-white text-lg">
                Account Information
              </h4>
            </div>

            <div className="p-0">
              <ProfileItem label="Display Name" value={currentUser || 'Not set'} />
              <ProfileItem
                label="Assigned Roles"
                value={roles.length ? roles.join(', ') : 'None'}
              />
              <ProfileItem
                label="Security Token"
                value={token ? 'Active Session' : 'Expired/Missing'}
                isStatus
                isActive={!!token}
              />
            </div>
          </div>

          <form
            onSubmit={handleChangeName}
            className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl space-y-4"
          >
            <h4 className="font-bold text-white text-lg">Change Display Name</h4>
            <div className="relative h-14">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="peer input-field"
                placeholder=" "
                maxLength={100}
                required
              />
              <label className="floating-label">New Name</label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary disabled:bg-gray-700 py-2 px-4 rounded-lg border border-transparent text-background/80 hover:bg-background/50 hover:border-primary hover:text-secondary transition-all duration-300 font-semibold"
            >
              {saving ? 'Saving...' : 'Save Name'}
            </button>
          </form>

          <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> Permissions are based on your assigned
              roles. If you need access to administrative tools, please contact
              the system owner.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const ProfileItem = ({
  label,
  value,
  isStatus,
  isActive,
}: {
  label: string;
  value: string;
  isStatus?: boolean;
  isActive?: boolean;
}) => (
  <div className="flex items-center justify-between p-6 border-b border-gray-800/50 last:border-0 hover:bg-white/5 transition-colors">
    <span className="text-gray-400 font-medium">{label}</span>
    {isStatus ? (
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${isActive ? 'bg-secondary shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}
        />
        <span
          className={
            isActive ? 'text-secondary font-bold' : 'text-red-400 font-bold'
          }
        >
          {value}
        </span>
      </div>
    ) : (
      <span className="text-white font-semibold">{value}</span>
    )}
  </div>
);

export default ProfilePage;
