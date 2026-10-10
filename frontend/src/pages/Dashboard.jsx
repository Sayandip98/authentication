import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ShieldCheck, UserCheck, KeyRound, ChevronRight, Lock } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-header">
        <h1>Welcome back, {user?.name} 👋</h1>
        <p>Here is an overview of your account and security status.</p>
      </div>

      <div className="dashboard-grid">
        {/* User Card */}
        <div className="dash-card">
          <h2>
            <UserCheck size={20} color="var(--primary)" />
            Profile Overview
          </h2>

          <div className="profile-summary">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-large-avatar" />
            ) : (
              <div className="profile-large-placeholder">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="profile-info">
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
              <span className={`badge badge-${user?.authProvider}`}>
                {user?.authProvider === "google" && "Google Account"}
                {user?.authProvider === "local" && "Email & Password"}
                {user?.authProvider === "both" && "Google & Password"}
              </span>
            </div>
          </div>

          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Account ID</span>
              <span className="info-value">{user?.id || "N/A"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Session Status</span>
              <span className="info-value" style={{ color: "#34d399" }}>
                Active (Secured)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="dash-card">
          <h2>
            <ShieldCheck size={20} color="var(--primary)" />
            Security & Settings
          </h2>

          <div className="quick-actions">
            <Link to="/profile" className="action-btn">
              <span>Edit Profile & Avatar</span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </Link>

            <Link to="/change-password" className="action-btn">
              <span>Change Password</span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </Link>
          </div>

          <div style={{ marginTop: "24px", color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center" }}>
            <Lock size={15} />
            <span>Protected by HTTP-only JWT cookies and rate-limiting.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
