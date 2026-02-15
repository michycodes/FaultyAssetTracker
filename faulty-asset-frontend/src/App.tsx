import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import AssetList from './components/AssetList';
import AssetStats from './components/AssetStats';
import CreateAsset from './components/CreateAsset';
import ProfilePage from './components/ProfilePage';
import {
  getDisplayUser,
  // getUserRoles,
  isLoggedIn,
  login,
  logout,
} from './services/auth';
import { toast, ToastContainer } from 'react-toastify';
import NavButton from './components/NavButton';
import { Box, ChartPie, User } from 'lucide-react';

type View = 'stats' | 'assets' | 'profile';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState<View>('stats');
  const [showCreateAsset, setShowCreateAsset] = useState(false);

  // const roles = useMemo(() => getUserRoles(), [loggedIn]);
  const displayUser = useMemo(() => getDisplayUser(), [loggedIn]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      setLoggedIn(true);
      setPassword('');
      setRefreshKey((k) => k + 1);
      toast.success(`Welcome back, ${email}!`);
    } catch {
      toast.error('Login failed. Check your email/password.');
    }
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setShowCreateAsset(false);
    toast.info('Logged out successfully');
  };

  // const handleCreated = () => {
  //   setRefreshKey((k) => k + 1);
  //   setShowCreateAsset(false);
  //   setActiveView('assets');
  //   toast.success('Asset tracked successfully!');
  // };

  if (loggedIn) {
    return (
      <main className="h-screen flex items-center justify-center">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <form
          onSubmit={handleLogin}
          className="p-8 flex flex-col border  rounded-lg w-full max-w-sm justify-center gap-8 bg-background shadow-md"
        >
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Faulty Asset Tracker</h1>
            <h2 className="text-lg opacity-70">Login</h2>
          </div>

          {/* Email Input Group */}
          <div className="relative h-14 w-full">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer input-field"
              placeholder=" "
              required
            />
            <label htmlFor="email" className="floating-label ">
              Email Address
            </label>
          </div>

          {/* Password Input Group */}
          <div className="relative h-14 w-full">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer input-field"
              placeholder=" "
              required
            />
            <label htmlFor="password" className="floating-label">
              Password
            </label>
          </div>
          <button
            type="submit"
            className="bg-primary text-background/80 hover:bg-background/50 hover:border-primary transition-all duration-300 font-semibold hover:text-secondary py-2 px-4 rounded border border-transparent"
          >
            Login
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </main>
    );
  }

  // Dashboard view for logged-in users

  return (
    <div className="flex h-screen bg-background text-primary overflow-hidden">
      <aside className="w-64 border-r border-neutral-800 bg-[#1f1e29] flex flex-col shadow-sm">
        <div className="p-6 ">
          <h2 className="text-xl font-bold ">Faulty Asset Tracker</h2>
        </div>
        <div className="p-4 border-t border-neutral-800 flex flex-col space-y-1">
          <h3>Menu</h3>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavButton
            active={activeView === 'stats'}
            onClick={() => {
              setActiveView('stats');
              setShowCreateAsset(false);
            }}
          >
            <div className="flex items-center gap-2">
              <ChartPie
                className={`${activeView === 'stats' ? 'text-secondary' : 'text-amber-800'} w-5 h-5`}
              />{' '}
              Overview
            </div>
          </NavButton>
          <NavButton
            active={activeView === 'assets'}
            onClick={() => {
              setActiveView('assets');
              setShowCreateAsset(false);
            }}
          >
            <div className="flex items-center gap-2">
              <Box
                className={`${activeView === 'assets' ? 'text-secondary' : 'text-cyan-800'} w-5 h-5`}
              />{' '}
              All Assets
            </div>
          </NavButton>
          <NavButton
            active={activeView === 'profile'}
            onClick={() => {
              setActiveView('profile');
              setShowCreateAsset(false);
            }}
          >
            <div className="flex items-center gap-2">
              <User
                className={`${activeView === 'profile' ? 'text-secondary' : 'text-purple-800'} w-5 h-5  `}
              />{' '}
              Profile
            </div>
          </NavButton>
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className=" shadow-sm flex items-center justify-between py-5 px-8 bg-background/80 backdrop-blur-md">
          <div>
            <span className="text-sm text-gray-400">Welcome, </span>
            <span className="font-semibold">{displayUser || 'User'}</span>
          </div>
          <button
            onClick={() => setShowCreateAsset(!showCreateAsset)}
            className="bg-primary text-background border border-transparent hover:border-primary hover:bg-transparent hover:text-secondary transition-all duration-300 px-4 py-2 rounded-lg text-sm font-bold "
          >
            {showCreateAsset ? 'Close Form' : '+ Track New Asset'}
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {showCreateAsset ? (
              <CreateAsset
                onCreated={() => {
                  setRefreshKey((k) => k + 1);
                  setShowCreateAsset(false);
                  setActiveView('assets');
                }}
              />
            ) : (
              <>
                {activeView === 'stats' && (
                  <AssetStats refreshKey={refreshKey} />
                )}
                {activeView === 'assets' && (
                  <AssetList refreshKey={refreshKey} />
                )}
                {activeView === 'profile' && <ProfilePage />}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
