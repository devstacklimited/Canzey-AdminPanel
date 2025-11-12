import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Building, Briefcase, Calendar, Shield, Globe } from 'lucide-react';
import './UserDetailsModal.css';

const UserDetailsModal = ({ user, isOpen, onClose, onUpdateUser }) => {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    company: '',
    job_title: '',
    role: '',
    status: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || '',
        company: user.company || '',
        job_title: user.job_title || '',
        role: user.role || '',
        status: user.status || ''
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update profile data
      const profileResponse = await fetch(`http://localhost:5000/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          website: formData.website,
          company: formData.company,
          job_title: formData.job_title
        })
      });

      // Update role/status if changed
      if (formData.role !== user.role || formData.status !== user.status) {
        const statusResponse = await fetch(`http://localhost:5000/api/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            role: formData.role,
            status: formData.status
          })
        });

        if (statusResponse.ok) {
          const result = await statusResponse.json();
          onUpdateUser(result.data);
        }
      }

      if (profileResponse.ok) {
        const result = await profileResponse.json();
        onUpdateUser(result.user);
      }

      setEditMode(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = (firstName, lastName) => {
    return [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen || !user) return null;

  return (
    <div className="user-modal-overlay" onClick={onClose}>
      <div className="user-modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="user-modal-header">
          <div className="user-modal-avatar-section">
            <div className="user-modal-avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" />
              ) : (
                <div className="user-modal-avatar-placeholder">
                  {getUserInitials(user.first_name, user.last_name)}
                </div>
              )}
            </div>
            <div className="user-modal-basic-info">
              <h2 className="user-modal-name">
                {user.display_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown User'}
              </h2>
              <p className="user-modal-email">{user.email}</p>
              <div className="user-modal-badges">
                <span className={`role-badge ${user.role}`}>{user.role}</span>
                <span className={`status-badge ${user.status}`}>{user.status}</span>
              </div>
            </div>
          </div>
          
          <div className="user-modal-actions">
            {editMode ? (
              <>
                <button 
                  onClick={handleSave} 
                  className="btn-save"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  onClick={() => setEditMode(false)} 
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setEditMode(true)} 
                className="btn-edit"
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className="btn-close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="user-modal-content">
          {/* Personal Information */}
          <div className="user-modal-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="user-modal-grid">
              <div className="user-modal-field">
                <label>
                  <User size={16} />
                  First Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="user-modal-input"
                  />
                ) : (
                  <span>{user.first_name || 'Not provided'}</span>
                )}
              </div>

              <div className="user-modal-field">
                <label>
                  <User size={16} />
                  Last Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="user-modal-input"
                  />
                ) : (
                  <span>{user.last_name || 'Not provided'}</span>
                )}
              </div>

              <div className="user-modal-field">
                <label>
                  <Mail size={16} />
                  Email
                </label>
                <span>{user.email}</span>
              </div>

              <div className="user-modal-field">
                <label>
                  <Phone size={16} />
                  Phone
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="user-modal-input"
                  />
                ) : (
                  <span>{user.phone || 'Not provided'}</span>
                )}
              </div>

              <div className="user-modal-field">
                <label>
                  <MapPin size={16} />
                  Location
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="user-modal-input"
                  />
                ) : (
                  <span>{user.location || 'Not provided'}</span>
                )}
              </div>

              <div className="user-modal-field">
                <label>
                  <Globe size={16} />
                  Website
                </label>
                {editMode ? (
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="user-modal-input"
                  />
                ) : (
                  <span>{user.website || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="user-modal-section">
            <h3 className="section-title">Professional Information</h3>
            <div className="user-modal-grid">
              <div className="user-modal-field">
                <label>
                  <Building size={16} />
                  Company
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="user-modal-input"
                  />
                ) : (
                  <span>{user.company || 'Not provided'}</span>
                )}
              </div>

              <div className="user-modal-field">
                <label>
                  <Briefcase size={16} />
                  Job Title
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    className="user-modal-input"
                  />
                ) : (
                  <span>{user.job_title || 'Not provided'}</span>
                )}
              </div>

              <div className="user-modal-field">
                <label>
                  <Shield size={16} />
                  Role
                </label>
                {editMode ? (
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="user-modal-select"
                  >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                )}
              </div>

              <div className="user-modal-field">
                <label>
                  <Shield size={16} />
                  Status
                </label>
                {editMode ? (
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="user-modal-select"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="hold">Hold</option>
                  </select>
                ) : (
                  <span className={`status-badge ${user.status}`}>{user.status}</span>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="user-modal-section">
            <h3 className="section-title">Bio</h3>
            <div className="user-modal-field full-width">
              {editMode ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="user-modal-textarea"
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="user-bio">{user.bio || 'No bio provided'}</p>
              )}
            </div>
          </div>

          {/* System Information */}
          <div className="user-modal-section">
            <h3 className="section-title">System Information</h3>
            <div className="user-modal-grid">
              <div className="user-modal-field">
                <label>
                  <Calendar size={16} />
                  Member Since
                </label>
                <span>{formatDate(user.created_at)}</span>
              </div>

              <div className="user-modal-field">
                <label>
                  <Calendar size={16} />
                  Last Login
                </label>
                <span>{user.last_login_at ? formatDate(user.last_login_at) : 'Never'}</span>
              </div>

              <div className="user-modal-field">
                <label>User ID</label>
                <span>{user.id}</span>
              </div>

              <div className="user-modal-field">
                <label>UUID</label>
                <span className="uuid-text">{user.uuid}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
