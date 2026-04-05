import { useAuth } from "../context/AuthContext";

export function DashboardHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="dashboard-header">
      <div>
        <p className="eyebrow">Climate Control System</p>
        <h1>Operations Dashboard</h1>
      </div>
      <div className="header-right">
        <span>{user?.name || "Operator"}</span>
        <button className="ghost-button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
