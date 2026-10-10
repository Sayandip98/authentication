import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../api/auth.api";
import { User, Mail, Camera, Trash2, CheckCircle2 } from "lucide-react";

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [nameLoading, setNameLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Handle local image file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 5MB" });
      return;
    }

    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMessage({ type: "", text: "" });
  };

  // Upload Avatar to Cloudinary
  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    setAvatarLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const res = await authAPI.updateAvatar(formData);
      const updatedUser = res.data?.data?.user;

      updateUser({ avatar: updatedUser.avatar });
      setSelectedFile(null);
      setAvatarPreview(null);
      setMessage({ type: "success", text: "Profile picture updated successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to upload avatar",
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  // Remove Avatar from Cloudinary
  const handleRemoveAvatar = async () => {
    if (!user?.avatar) return;

    setAvatarLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await authAPI.removeAvatar();
      updateUser({ avatar: "" });
      setSelectedFile(null);
      setAvatarPreview(null);
      setMessage({ type: "success", text: "Profile picture removed successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to remove avatar",
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  // Update Name
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name === user?.name) return;

    setNameLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await authAPI.updateProfile({ name: name.trim() });
      const updatedUser = res.data?.data?.user;

      updateUser({ name: updatedUser.name });
      setMessage({ type: "success", text: "Name updated successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setNameLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: "600px" }}>
      <div className="welcome-header">
        <h1>Profile Settings</h1>
        <p>Manage your account details and profile picture</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Avatar Section */}
      <div className="dash-card" style={{ marginBottom: "24px" }}>
        <h2>Profile Picture</h2>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "16px" }}>
          <div style={{ position: "relative" }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="profile-large-avatar" />
            ) : user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-large-avatar" />
            ) : (
              <div className="profile-large-placeholder">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <label className="btn btn-primary" style={{ width: "auto", padding: "8px 16px", cursor: "pointer" }}>
                <Camera size={16} />
                <span>Choose Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </label>

              {selectedFile && (
                <button
                  onClick={handleAvatarUpload}
                  disabled={avatarLoading}
                  className="btn btn-primary"
                  style={{ width: "auto", padding: "8px 16px", background: "#10b981" }}
                >
                  {avatarLoading ? <div className="spinner"></div> : "Save Photo"}
                </button>
              )}

              {user?.avatar && !selectedFile && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={avatarLoading}
                  className="btn-logout"
                  style={{ padding: "8px 14px" }}
                >
                  <Trash2 size={16} />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              JPG, PNG, WEBP up to 5MB. Face-centered automatically.
            </span>
          </div>
        </div>
      </div>

      {/* Personal Info Section */}
      <div className="dash-card">
        <h2>Personal Information</h2>

        <form onSubmit={handleNameSubmit} style={{ marginTop: "16px" }}>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon-left" size={18} />
              <input
                id="name"
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div className="form-group">
            <label htmlFor="email">Email Address (Cannot be changed)</label>
            <div className="input-wrapper">
              <Mail className="input-icon-left" size={18} />
              <input
                id="email"
                type="email"
                className="input-field"
                value={user?.email || ""}
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={nameLoading || name === user?.name}
            style={{ width: "auto", minWidth: "140px" }}
          >
            {nameLoading ? <div className="spinner"></div> : "Update Name"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
