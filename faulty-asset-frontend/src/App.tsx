import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import AssetList from "./components/AssetList";
import AssetStats from "./components/AssetStats";
import CreateAsset from "./components/CreateAsset";
import ProfilePage from "./components/ProfilePage";
import {
  getDisplayUser,
  getUserRoles,
  isLoggedIn,
  login,
  logout,
} from "./services/auth";

type View = "stats" | "assets" | "profile";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState<View>("stats");
  const [showCreateAsset, setShowCreateAsset] = useState(false);

  const roles = useMemo(() => getUserRoles(), [loggedIn]);
  const displayUser = useMemo(() => getDisplayUser(), [loggedIn]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      setLoggedIn(true);
      setPassword("");
      setRefreshKey((k) => k + 1);
    } catch {
      setError("Login failed. Check your email/password and backend status.");
    }
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setShowCreateAsset(false);
  };

  const handleCreated = () => {
    setRefreshKey((k) => k + 1);
    setShowCreateAsset(false);
    setActiveView("assets");
  };

  if (!loggedIn) {
    return (
      <main className="login-page">
        <form onSubmit={handleLogin} className="login-card">
          <h1>Faulty Asset Tracker</h1>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <h2>Menu</h2>
        <button
          className={activeView === "stats" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveView("stats")}
        >
          Stats
        </button>
        <button
          className={activeView === "assets" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveView("assets")}
        >
          View Assets
        </button>
        <button
          className={activeView === "profile" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveView("profile")}
        >
          Profile
        </button>
      </aside>

      <section className="content-area">
        <header className="topbar">
          <div>
            <h1>Faulty Asset Tracker</h1>
            <p>
              <strong>User:</strong> {displayUser || "Unknown user"} | <strong>Roles:</strong>{" "}
              {roles.length > 0 ? roles.join(", ") : "No roles in token"}
            </p>
          </div>

          <div className="topbar-actions">
            <button onClick={() => setShowCreateAsset((s) => !s)}>
              {showCreateAsset ? "Close Create Form" : "Create Faulty Asset"}
            </button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {showCreateAsset && (
          <div className="create-panel">
            <CreateAsset onCreated={handleCreated} />
          </div>
        )}

        {!showCreateAsset && activeView === "stats" && <AssetStats refreshKey={refreshKey} />}
        {!showCreateAsset && activeView === "assets" && <AssetList refreshKey={refreshKey} />}
        {!showCreateAsset && activeView === "profile" && <ProfilePage />}
      </section>
    </main>
  );
}

export default App;