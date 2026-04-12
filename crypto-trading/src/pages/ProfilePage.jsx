import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import "./ProfilePage.css";

export function ProfilePage() {
  const { user, navigate, logout, updateProfile, getUserTrades } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    username: user?.username || "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get user's trades
  const userTrades = getUserTrades?.(user?.id) || [];

  // Calculate statistics
  const stats = {
    totalTrades: userTrades.length,
    totalVolume: userTrades.reduce((sum, t) => sum + t.total, 0),
    winRate: Math.round((userTrades.filter(t => t.resultType === "profit").length / userTrades.length) * 100) || 0,
    bestTrade: Math.max(...userTrades.map(t => t.total), 0),
  };

  const handleSaveProfile = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      bio: user?.bio || "",
      username: user?.username || "",
    });
    setIsEditing(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="profile-page">
      {/* Header with Back Button */}
      <div className="profile-header">
        <button className="profile-back-btn" onClick={() => navigate("dashboard")}>
          ← Back to Dashboard
        </button>
        <button className="profile-logout-btn-header" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Profile Cover & Avatar */}
      <div className="profile-cover">
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          <button className="profile-avatar-edit" onClick={() => setIsEditing(true)}>
            📷
          </button>
        </div>
        <h1 className="profile-name">{user?.name || "User"}</h1>
        <p className="profile-username">@{user?.username || user?.email?.split('@')[0]}</p>
        <p className="profile-joined">Member since {user?.joined || "January 2024"}</p>
      </div>

      {/* Stats Cards */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Total Trades</span>
            <span className="stat-value">{stats.totalTrades}</span>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-label">Total Volume</span>
            <span className="stat-value">{formatCurrency(stats.totalVolume)}</span>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <span className="stat-label">Win Rate</span>
            <span className="stat-value">{stats.winRate}%</span>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <span className="stat-label">Best Trade</span>
            <span className="stat-value">{formatCurrency(stats.bestTrade)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs-container">
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            👤 Overview
          </button>
          <button 
            className={`profile-tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            🔒 Security
          </button>
          <button 
            className={`profile-tab ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            📋 Activity
          </button>
          <button 
            className={`profile-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Settings
          </button>
        </div>

        <div className="profile-tab-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="profile-overview">
              <div className="profile-info-section">
                <div className="section-header">
                  <h3>Personal Information</h3>
                  {!isEditing && (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Username</label>
                      <input 
                        type="text" 
                        value={editForm.username}
                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                        placeholder="Choose a username"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input 
                        type="tel" 
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input 
                        type="text" 
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea 
                        rows="3"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="form-actions">
                      <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                      <button className="save-btn" onClick={handleSaveProfile}>Save Changes</button>
                    </div>
                  </div>
                ) : (
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="info-label">Full Name</span>
                      <span className="info-value">{user?.name || "Not set"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Username</span>
                      <span className="info-value">@{user?.username || user?.email?.split('@')[0]}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email Address</span>
                      <span className="info-value">{user?.email || "Not set"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Phone Number</span>
                      <span className="info-value">{user?.phone || "Not set"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Location</span>
                      <span className="info-value">{user?.location || "Not set"}</span>
                    </div>
                    <div className="info-row full-width">
                      <span className="info-label">Bio</span>
                      <span className="info-value">{user?.bio || "No bio yet"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Wallet Info */}
              <div className="profile-wallet-section">
                <h3>Wallet Information</h3>
                <div className="wallet-stats">
                  <div className="wallet-stat">
                    <span className="wallet-label">Available Balance</span>
                    <span className="wallet-value">{formatCurrency(user?.balance || 0)}</span>
                  </div>
                  <div className="wallet-stat">
                    <span className="wallet-label">Portfolio Value</span>
                    <span className="wallet-value">{formatCurrency(Object.values(user?.portfolio || {}).reduce((sum, val) => sum + val, 0))}</span>
                  </div>
                  <div className="wallet-stat">
                    <span className="wallet-label">Total Assets</span>
                    <span className="wallet-value">{Object.keys(user?.portfolio || {}).length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="profile-security">
              <div className="security-card">
                <div className="security-icon">🔐</div>
                <div className="security-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button className="security-btn">Enable 2FA</button>
              </div>

              <div className="security-card">
                <div className="security-icon">🔑</div>
                <div className="security-info">
                  <h4>Change Password</h4>
                  <p>Update your password regularly to keep your account secure</p>
                </div>
                <button className="security-btn">Change</button>
              </div>

              <div className="security-card">
                <div className="security-icon">📱</div>
                <div className="security-info">
                  <h4>Device Management</h4>
                  <p>Manage devices that have access to your account</p>
                </div>
                <button className="security-btn">Manage</button>
              </div>

              <div className="security-card">
                <div className="security-icon">📧</div>
                <div className="security-info">
                  <h4>Email Notifications</h4>
                  <p>Configure what emails you receive from us</p>
                </div>
                <button className="security-btn">Configure</button>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="profile-activity">
              {userTrades.length === 0 ? (
                <div className="empty-activity">
                  <span>📭</span>
                  <h4>No Activity Yet</h4>
                  <p>Start trading to see your activity here</p>
                  <button className="start-trading-btn" onClick={() => navigate("trade")}>
                    Start Trading →
                  </button>
                </div>
              ) : (
                <div className="activity-list">
                  {userTrades.slice(0, 20).map((trade, index) => (
                    <div key={trade.id || index} className="activity-item">
                      <div className={`activity-icon ${trade.type}`}>
                        {trade.type === "buy" ? "📈" : "📉"}
                      </div>
                      <div className="activity-details">
                        <div className="activity-title">
                          {trade.type === "buy" ? "Bought" : "Sold"} {trade.coin}
                        </div>
                        <div className="activity-time">
                          {new Date(trade.time).toLocaleString()}
                        </div>
                      </div>
                      <div className="activity-amount">
                        <div className="amount-value">{trade.amount.toFixed(4)} {trade.coin}</div>
                        <div className="amount-price">@{formatCurrency(trade.price)}</div>
                      </div>
                      <div className={`activity-result ${trade.resultType === "profit" ? "profit" : trade.resultType === "loss" ? "loss" : "normal"}`}>
                        {formatCurrency(trade.total)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="profile-settings">
              <div className="settings-group">
                <h3>Preferences</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">Language</span>
                    <span className="setting-value">English (US)</span>
                  </div>
                  <button className="setting-btn">Change</button>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">Currency Display</span>
                    <span className="setting-value">USD ($)</span>
                  </div>
                  <button className="setting-btn">Change</button>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-label">Theme</span>
                    <span className="setting-value">Dark</span>
                  </div>
                  <button className="setting-btn">Change</button>
                </div>
              </div>

              <div className="settings-group">
                <h3>Notifications</h3>
                <div className="setting-item toggle-item">
                  <div className="setting-info">
                    <span className="setting-label">Price Alerts</span>
                    <span className="setting-value">Receive alerts for price movements</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item toggle-item">
                  <div className="setting-info">
                    <span className="setting-label">Trade Confirmations</span>
                    <span className="setting-value">Get notified when trades execute</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item toggle-item">
                  <div className="setting-info">
                    <span className="setting-label">Marketing Emails</span>
                    <span className="setting-value">Receive promotions and updates</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-group danger-zone">
                <h3>Danger Zone</h3>
                <div className="setting-item danger-item">
                  <div className="setting-info">
                    <span className="setting-label">Delete Account</span>
                    <span className="setting-value">Permanently delete your account and all data</span>
                  </div>
                  <button className="danger-btn" onClick={() => setShowDeleteConfirm(true)}>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account?</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.</p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="modal-confirm" onClick={logout}>Yes, Delete My Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}