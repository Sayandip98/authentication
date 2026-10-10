import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ textAlign: "center", maxWidth: "480px" }}>
        <div style={{ display: "inline-flex", padding: "16px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.12)", marginBottom: "20px" }}>
          <AlertTriangle size={48} color="#ef4444" />
        </div>

        <h1 style={{ fontSize: "3rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "8px", letterSpacing: "-0.03em" }}>
          404
        </h1>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "10px" }}>
          Page Not Found
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "28px" }}>
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: "none" }}>
          <Home size={18} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
