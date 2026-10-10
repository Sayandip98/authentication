import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Shield, User, LogOut } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="nav-brand">
        <Shield size={24} className="brand-icon" />
        <span>AuthShield</span>
      </Link>

      <div className="nav-links">
        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>
        <Link to="/profile" className="nav-link">
          Profile
        </Link>
      </div>

      <div className="nav-user">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="nav-avatar" />
        ) : (
          <div className="nav-avatar-placeholder">
            {user?.name?.charAt(0).toUpperCase() || <User size={18} />}
          </div>
        )}

        <button onClick={handleLogout} className="btn-logout" title="Log out">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

    </nav>
  )
}

export default Navbar