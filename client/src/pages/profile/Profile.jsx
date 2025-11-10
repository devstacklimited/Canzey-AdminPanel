import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Camera, Save, X } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'System administrator and developer with 5+ years of experience in web technologies and cloud infrastructure.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
  });

  const [tempData, setTempData] = useState({ ...profileData });

  const handleEdit = () => {
    setTempData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
  };

  const handleSave = () => {
    setProfileData({ ...tempData });
    setIsEditing(false);
    // Add save logic here
  };

  const handleInputChange = (field, value) => {
    setTempData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div className="profile-container">
        {/* Page Header */}
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your personal information</p>
        </div>

        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-container">
                <div className="profile-avatar">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
                    alt="Profile"
                    className="profile-avatar-img"
                  />
                  {isEditing && (
                    <button className="profile-avatar-edit">
                      <Camera size={20} />
                    </button>
                  )}
                </div>
                <div className="profile-avatar-info">
                  <h2 className="profile-name">{profileData.firstName} {profileData.lastName}</h2>
                  <p className="profile-role">Administrator</p>
                  <div className="profile-status">
                    <span className="profile-status-indicator"></span>
                    <span>Active</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="profile-actions">
                {!isEditing ? (
                  <button onClick={handleEdit} className="profile-btn profile-btn-primary">
                    <Edit size={20} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="profile-edit-actions">
                    <button onClick={handleSave} className="profile-btn profile-btn-success">
                      <Save size={20} />
                      Save
                    </button>
                    <button onClick={handleCancel} className="profile-btn profile-btn-secondary">
                      <X size={20} />
                      Cancel
                    </button>
                  </div>
                )}
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
                        value={tempData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">{profileData.firstName}</div>
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
                        value={tempData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">{profileData.lastName}</div>
                    )}
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-label">
                      <Mail size={16} />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={tempData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">{profileData.email}</div>
                    )}
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-label">
                      <Phone size={16} />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={tempData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">{profileData.phone}</div>
                    )}
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-label">
                      <MapPin size={16} />
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">{profileData.location}</div>
                    )}
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-label">
                      <Calendar size={16} />
                      Member Since
                    </label>
                    <div className="profile-value">January 15, 2024</div>
                  </div>
                </div>
              </div>

              <div className="profile-form-section">
                <h3 className="profile-form-title">About</h3>
                
                <div className="profile-form-group">
                  <label className="profile-label">Bio</label>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={tempData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="profile-textarea"
                    />
                  ) : (
                    <div className="profile-value profile-bio">{profileData.bio}</div>
                  )}
                </div>
              </div>

              <div className="profile-form-section">
                <h3 className="profile-form-title">Social Links</h3>
                
                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label className="profile-label">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={tempData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">
                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="profile-link">
                          {profileData.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-label">LinkedIn</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">
                        <a href={`https://${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                          {profileData.linkedin}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-label">GitHub</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">
                        <a href={`https://${profileData.github}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                          {profileData.github}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="profile-stats-card">
            <h3 className="profile-stats-title">Activity Stats</h3>
            
            <div className="profile-stats-grid">
              <div className="profile-stat-item">
                <div className="profile-stat-value">247</div>
                <div className="profile-stat-label">Total Orders</div>
              </div>
              
              <div className="profile-stat-item">
                <div className="profile-stat-value">89</div>
                <div className="profile-stat-label">Products Managed</div>
              </div>
              
              <div className="profile-stat-item">
                <div className="profile-stat-value">156</div>
                <div className="profile-stat-label">Support Tickets</div>
              </div>
              
              <div className="profile-stat-item">
                <div className="profile-stat-value">98%</div>
                <div className="profile-stat-label">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
