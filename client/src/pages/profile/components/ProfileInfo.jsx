import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, Building, Briefcase, Edit, Camera, Save, X, LogOut } from 'lucide-react';
import './ProfileInfo.css';

const ProfileInfo = ({ 
  user, 
  isEditing, 
  tempData, 
  onEdit, 
  onSave, 
  onCancel, 
  onLogout, 
  onInputChange,
  getUserInitials 
}) => {
  return (
    <div className="profile-content">
      {/* Profile Card */}
      <div className="profile-card">
        {/* Top Action Buttons */}
        <div className="profile-top-actions">
          {!isEditing ? (
            <button onClick={onEdit} className="top-action-btn edit-top-btn">
              <Edit size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="top-edit-actions">
              <button onClick={onSave} className="top-action-btn save-top-btn">
                <Save size={16} />
                Save
              </button>
              <button onClick={onCancel} className="top-action-btn cancel-top-btn">
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
          
          <button onClick={onLogout} className="top-action-btn logout-top-btn">
            <LogOut size={16} />
            Logout
          </button>
        </div>
        <div className="profile-avatar-section">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="profile-avatar-img"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {getUserInitials(user?.name)}
                </div>
              )}
              {isEditing && (
                <button className="profile-avatar-edit">
                  <Camera size={20} />
                </button>
              )}
            </div>
            <div className="profile-avatar-info">
              <h2 className="profile-name">{user?.display_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'User'}</h2>
              <p className="profile-role">{user?.role || 'User'}</p>
              <div className="profile-status">
                <span className={`profile-status-indicator ${user?.status}`}></span>
                <span className={`profile-status-text ${user?.status}`}>
                  {user?.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="profile-form">
          <div className="profile-form-section">
            <h3 className="profile-form-title">Basic Information</h3>
            
            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label className="profile-label">
                  <User size={16} />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.first_name}
                    onChange={(e) => onInputChange('first_name', e.target.value)}
                    className="profile-input"
                  />
                ) : (
                  <div className="profile-value">{user?.first_name || 'N/A'}</div>
                )}
              </div>

              <div className="profile-form-group">
                <label className="profile-label">
                  <User size={16} />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.last_name}
                    onChange={(e) => onInputChange('last_name', e.target.value)}
                    className="profile-input"
                  />
                ) : (
                  <div className="profile-value">{user?.last_name || 'N/A'}</div>
                )}
              </div>

              <div className="profile-form-group">
                <label className="profile-label">
                  <Mail size={16} />
                  Email Address
                </label>
                <div className="profile-value">{user?.email || 'N/A'}</div>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">
                  <Phone size={16} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={tempData.phone_number}
                    onChange={(e) => onInputChange('phone_number', e.target.value)}
                    className="profile-input"
                  />
                ) : (
                  <div className="profile-value">{user?.phone_number || 'Not provided'}</div>
                )}
              </div>

              <div className="profile-form-group">
                <label className="profile-label">
                  <Calendar size={16} />
                  Member Since
                </label>
                <div className="profile-value">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">
                  <Calendar size={16} />
                  Last Login
                </label>
                <div className="profile-value">
                  {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
