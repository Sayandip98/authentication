import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../api/auth.api";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setMessage({ type: "success", text: "Password changed successfully!" });
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      navigate('/profile')
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  // If user only signed in with Google and has no local password
  if (user?.authProvider === "google") {
    return (
      <div className="dashboard-container" style={{ maxWidth: "540px" }}>
        <div className="welcome-header">
          <h1>Change Password</h1>
          <p>Your account is authenticated via Google Sign In.</p>
        </div>
        <div className="alert alert-success">
          You don't need a password since you use Google OAuth to securely sign in.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ maxWidth: "540px" }}>
      <div className="welcome-header">
        <h1>Change Password</h1>
        <p>Ensure your account is using a long, random password.</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="dash-card">
        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                className="input-field"
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input
                id="newPassword"
                type={showNew ? "text" : "password"}
                name="newPassword"
                className="input-field"
                placeholder="Min 6 characters"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="input-field"
                placeholder="Repeat new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
