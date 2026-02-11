import { useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import CreateAsset from "./components/CreateAsset";
import { isLoggedIn, login, logout } from "./services/auth";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      setLoggedIn(true);
      setPassword("");
    } catch {
      setError("Login failed. Check your email/password and backend status.");
    }
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
  };

  return (
    <main style={{ maxWidth: 700, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Faulty Asset Tracker</h1>

      {!loggedIn ? (
        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 380 }}
        >
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
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      ) : (
        <>
          <button onClick={handleLogout} style={{ marginBottom: "1rem" }}>
            Logout
          </button>
          <CreateAsset />
        </>
      )}
    </main>
  );
}

export default App;