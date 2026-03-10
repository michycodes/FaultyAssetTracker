import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Trash2, RefreshCw } from 'lucide-react';
import { getDisplayUser } from '../services/auth';

function ManageUsers() {
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const currentUser = getDisplayUser();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get<string[]>('/admin/users');
      setUsers(res.data ?? []);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const handleDelete = async (username: string) => {
    if (username === currentUser) {
      toast.error("You can't delete your own account.");
      return;
    }

    const confirmed = window.confirm(
      `Delete user "${username}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingUser(username);
    try {
      await api.delete(
        `/admin/users/${encodeURIComponent(username)}`,
      );
      toast.success(`User "${username}" deleted.`);
      setUsers((prev) => prev.filter((u) => u !== username));
    } catch (error: any) {
      const data = error.response?.data;
      const message =
        Array.isArray(data)
          ? data.map((e: any) => e.description ?? e).join(', ')
          : data?.title || data?.message || data || 'Failed to delete user.';
      toast.error(String(message));
    } finally {
      setDeletingUser(null);
    }
  };

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Users</h2>
          <p className="text-gray-400 text-sm mt-1">
            View and remove platform users.
          </p>
        </div>
        <button
          onClick={() => void fetchUsers()}
          className="flex items-center gap-2 px-4 py-2 border border-neutral-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-gray-500">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-neutral-800 rounded-2xl text-gray-500">
          No users found.
        </div>
      ) : (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto] px-6 py-3 border-b border-neutral-800 bg-neutral-900/60">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Username
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Action
            </span>
          </div>

          {/* User rows */}
          <ul>
            {users.map((user, idx) => {
              const isSelf = user === currentUser;
              const isDeleting = deletingUser === user;

              return (
                <li
                  key={user}
                  className={`grid grid-cols-[1fr_auto] items-center px-6 py-4 transition-colors hover:bg-white/5 ${
                    idx !== users.length - 1
                      ? 'border-b border-neutral-800/60'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar initials */}
                    <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-black text-secondary">
                        {user.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {user}
                      </p>
                      {isSelf && (
                        <p className="text-[10px] text-secondary">
                          (you)
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => void handleDelete(user)}
                    disabled={isSelf || isDeleting}
                    title={isSelf ? "Can't delete your own account" : `Delete ${user}`}
                    className="px-3 py-2 text-gray-600 hover:text-red-500 border border-neutral-800 hover:border-red-500/30 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/60">
            <p className="text-[10px] text-gray-600">
              {users.length} user{users.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default ManageUsers;