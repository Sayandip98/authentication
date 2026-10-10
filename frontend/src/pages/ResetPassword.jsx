import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api/auth.api";
import { useAuth } from "../hooks/useAuth";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await authAPI.resetPassword(token, password);
      const user = res.data?.data?.user;
      if (user) {
        updateUser(user);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Reset link is invalid or has expired. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Choose a new, strong password for your account.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {success ? (
          <div className="alert alert-success" style={{ flexDirection: "column", textAlign: "center", padding: "20px" }}>
            <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: "10px" }} />
            <p style={{ fontWeight: 600, color: "#34d399", marginBottom: "4px" }}>
              Password Reset Successfully!
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Redirecting you to your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon-left" size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon-left" size={18} />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Reset Password"}
            </button>

            <div className="auth-footer">
              <Link to="/login" className="link-text">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
