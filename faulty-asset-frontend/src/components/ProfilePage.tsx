import { getDisplayUser, getUserRoles, getToken } from '../services/auth';

function ProfilePage() {
  const user = getDisplayUser();
  const roles = getUserRoles();
  const token = getToken();

  // Generate initials for the avatar
  const initials = user
    ? user
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '??';

  return (
    <section className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">User Profile</h2>
        <p className="text-gray-400 text-sm">
          Manage your account details and permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-2xl flex flex-col items-center text-center backdrop-blur-sm">
            <div className="w-24 h-24 bg-emerald-600/20 border-2 border-secondary rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl font-black text-secondary">
                {initials}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {user || 'Unknown User'}
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

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-neutral-800">
              <h4 className="font-bold text-white text-lg">
                Account Information
              </h4>
            </div>

            <div className="p-0">
              <ProfileItem label="Display Name" value={user || 'Not set'} />
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

// Helper Component for Info Rows
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
