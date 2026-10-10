import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../api/auth.api";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>
            {submitted
              ? "Check your inbox"
              : "Enter your email address and we'll send you a password reset link."}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {submitted ? (
          <div>
            <div className="alert alert-success" style={{ flexDirection: "column", textAlign: "center", padding: "20px" }}>
              <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: "10px" }} />
              <p style={{ fontWeight: 600, fontSize: "1rem", color: "#34d399", marginBottom: "6px" }}>
                Reset link sent!
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                If an account exists for <strong>{email}</strong>, you will receive an email with instructions within a few minutes.
              </p>
            </div>

            <div className="auth-footer" style={{ marginTop: "24px" }}>
              <Link to="/login" className="btn btn-primary" style={{ textDecoration: "none" }}>
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon-left" size={18} />
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Send Reset Link"}
            </button>

            <div className="auth-footer">
              <Link to="/login" className="link-text" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
