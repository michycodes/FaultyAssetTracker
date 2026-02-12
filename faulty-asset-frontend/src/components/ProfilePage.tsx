import { getDisplayUser, getUserRoles, getToken } from "../services/auth";

function ProfilePage() {
  const user = getDisplayUser();
  const roles = getUserRoles();
  const token = getToken();

  return (
    <section>
      <h2>Profile</h2>
      <div style={{ background: "#fff", borderRadius: 12, padding: "1rem" }}>
        <p>
          <strong>User:</strong> {user || "Unknown"}
        </p>
        <p>
          <strong>Roles:</strong> {roles.length ? roles.join(", ") : "No roles found"}
        </p>
        <p>
          <strong>Token Status:</strong> {token ? "Available" : "Missing"}
        </p>
      </div>
    </section>
  );
}

export default ProfilePage;