import { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

type CreateUserForm = {
  email: string;
  password: string;
  role: string;
};

const initialForm: CreateUserForm = {
  email: '',
  password: '',
  role: 'Employee',
};

function CreateUser() {
  const [form, setForm] = useState<CreateUserForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post(
        `/admin/create-user?email=${encodeURIComponent(form.email)}&password=${encodeURIComponent(form.password)}&role=${encodeURIComponent(form.role)}`,
      );
      toast.success(`User "${form.email}" created successfully!`);
      setForm(initialForm);
    } catch (error: any) {
      const data = error.response?.data;
      const message =
        Array.isArray(data)
          ? data.map((e: any) => e.description ?? e).join(', ')
          : data?.title || data?.message || data || 'Failed to create user.';
      toast.error(String(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Create New User</h2>
        <p className="text-gray-400 text-sm mt-1">
          Admin-only: register a new platform user and assign their role.
        </p>
      </div>

      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-8 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email */}
          <div className="relative h-14">
            <input
              type="email"
              name="email"
              id="cu-email"
              value={form.email}
              onChange={handleChange}
              className="peer input-field"
              placeholder=" "
              required
            />
            <label htmlFor="cu-email" className="floating-label">
              Email Address
            </label>
          </div>

          {/* Password */}
          <div className="relative h-14">
            <input
              type="password"
              name="password"
              id="cu-password"
              value={form.password}
              onChange={handleChange}
              className="peer input-field"
              placeholder=" "
              required
              minLength={6}
            />
            <label htmlFor="cu-password" className="floating-label">
              Password
            </label>
          </div>

          {/* Role */}
          <div className="relative h-14">
            <select
              name="role"
              id="cu-role"
              value={form.role}
              onChange={handleChange}
              className="peer input-field appearance-none cursor-pointer"
            >
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
            </select>
            <label htmlFor="cu-role" className="floating-label">
              Role
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary disabled:bg-gray-700 py-3 transition-all active:scale-[0.98] cursor-pointer text-background/80 hover:bg-background/50 hover:border-primary duration-300 font-semibold hover:text-secondary px-4 rounded-lg border border-transparent"
          >
            {isSubmitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      {/* Info callout */}
      <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
        <p className="text-sm text-amber-400">
          <strong>Note:</strong> The new user will be assigned the{' '}
          <span className="font-mono text-xs bg-amber-500/10 px-1 py-0.5 rounded">
            Employee
          </span>{' '}
          role by default. Admins can change this later if needed.
        </p>
      </div>
    </section>
  );
}

export default CreateUser;