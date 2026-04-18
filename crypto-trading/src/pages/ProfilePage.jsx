import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import "./ProfilePage.css";

// SVG Icons Component
const Icons = {
  Back: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19L5 12L12 5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17L21 12L16 7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3L21 7L7 21H3V17L17 3Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Camera: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Chart: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 16L15 10L11 14L3 6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 10V16H15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Wallet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" strokeLinejoin="round"/>
      <path d="M3 9H21" strokeLinecap="round"/>
      <circle cx="17" cy="13" r="1.2" fill="currentColor"/>
    </svg>
  ),
  
  Trophy: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 9H3C2.44772 9 2 8.55228 2 8V5C2 4.44772 2.44772 4 3 4H6" strokeLinecap="round"/>
      <path d="M18 9H21C21.5523 9 22 8.55228 22 8V5C22 4.44772 21.5523 4 21 4H18" strokeLinecap="round"/>
      <path d="M12 14V20M8 20H16" strokeLinecap="round"/>
      <path d="M12 14C9.23858 14 7 11.7614 7 9V4H17V9C17 11.7614 14.7614 14 12 14Z" strokeLinejoin="round"/>
    </svg>
  ),
  
  Star: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinejoin="round"/>
    </svg>
  ),
  
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" strokeLinecap="round"/>
      <path d="M5 20V19C5 15.5 8.5 14 12 14C15.5 14 19 15.5 19 19V20" strokeLinecap="round"/>
    </svg>
  ),
  
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="11" width="14" height="11" rx="2" strokeLinecap="round"/>
      <path d="M8 11V7C8 4.5 9.5 3 12 3C14.5 3 16 4.5 16 7V11" strokeLinecap="round"/>
    </svg>
  ),
  
  Key: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7.5" cy="16.5" r="4.5" strokeLinecap="round"/>
      <path d="M17 7L22 12M14 10L17 7L20 10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Device: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="2" strokeLinecap="round"/>
      <path d="M12 18H12.01" strokeLinecap="round"/>
    </svg>
  ),
  
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" strokeLinecap="round"/>
    </svg>
  ),
  
  Globe: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12H22M12 2C14.5 4.5 15 9 15 12C15 15 14.5 19.5 12 22C9.5 19.5 9 15 9 12C9 9 9.5 4.5 12 2Z" strokeLinecap="round"/>
    </svg>
  ),
  
  Moon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Alert: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 8V12M12 16H12.01M3 12C3 7.5 7.5 3 12 3C16.5 3 21 7.5 21 12C21 16.5 16.5 21 12 21C7.5 21 3 16.5 3 12Z" strokeLinecap="round"/>
    </svg>
  ),
  
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 11V17M14 11V17" strokeLinecap="round"/>
    </svg>
  ),
  
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12H19M12 5L19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  ActivityBuy: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
      <path d="M12 5V19M12 5L8 9M12 5L16 9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  ActivitySell: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
      <path d="M12 19V5M12 19L8 15M12 19L16 15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

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
          <Icons.Back /> Back to Dashboard
        </button>
        <button className="profile-logout-btn-header" onClick={logout}>
          <Icons.Logout /> Logout
        </button>
      </div>

      {/* Profile Cover & Avatar */}
      <div className="profile-cover">
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          <button className="profile-avatar-edit" onClick={() => setIsEditing(true)}>
            <Icons.Camera />
          </button>
        </div>
        <h1 className="profile-name">{user?.name || "User"}</h1>
        <p className="profile-username">@{user?.username || user?.email?.split('@')[0]}</p>
        <p className="profile-joined">Member since {user?.joined || "January 2024"}</p>
      </div>

      {/* Stats Cards */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="stat-icon"><Icons.Chart /></div>
          <div className="stat-content">
            <span className="stat-label">Total Trades</span>
            <span className="stat-value">{stats.totalTrades}</span>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-icon"><Icons.Wallet /></div>
          <div className="stat-content">
            <span className="stat-label">Total Volume</span>
            <span className="stat-value">{formatCurrency(stats.totalVolume)}</span>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-icon"><Icons.Trophy /></div>
          <div className="stat-content">
            <span className="stat-label">Win Rate</span>
            <span className="stat-value">{stats.winRate}%</span>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-icon"><Icons.Star /></div>
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
            <Icons.User /> Overview
          </button>
          <button 
            className={`profile-tab ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Icons.Lock /> Security
          </button>
          <button 
            className={`profile-tab ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            <Icons.Chart /> Activity
          </button>
          <button 
            className={`profile-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Icons.Globe /> Settings
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
                      <Icons.Edit /> Edit Profile
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
                <div className="security-icon"><Icons.Lock /></div>
                <div className="security-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button className="security-btn">Enable 2FA</button>
              </div>

              <div className="security-card">
                <div className="security-icon"><Icons.Key /></div>
                <div className="security-info">
                  <h4>Change Password</h4>
                  <p>Update your password regularly to keep your account secure</p>
                </div>
                <button className="security-btn">Change</button>
              </div>

              <div className="security-card">
                <div className="security-icon"><Icons.Device /></div>
                <div className="security-info">
                  <h4>Device Management</h4>
                  <p>Manage devices that have access to your account</p>
                </div>
                <button className="security-btn">Manage</button>
              </div>

              <div className="security-card">
                <div className="security-icon"><Icons.Bell /></div>
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
                    Start Trading <Icons.ArrowRight />
                  </button>
                </div>
              ) : (
                <div className="activity-list">
                  {userTrades.slice(0, 20).map((trade, index) => (
                    <div key={trade.id || index} className="activity-item">
                      <div className={`activity-icon ${trade.type}`}>
                        {trade.type === "buy" ? <Icons.ActivityBuy /> : <Icons.ActivitySell />}
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
                    <Icons.Trash /> Delete Account
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