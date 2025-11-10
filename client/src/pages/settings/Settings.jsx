import React, { useState } from 'react';
import { Save, User, Bell, Shield, Palette, Globe, Database } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    siteName: 'Canzey Admin',
    siteEmail: 'admin@canzey.com',
    timezone: 'UTC',
    language: 'English',
    notifications: true,
    twoFactor: false,
    theme: 'light',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Storage', icon: Database },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Settings saved:', formData);
    // Add save logic here
  };

  return (
    <Layout>
      <div className="settings-container">
        {/* Page Header */}
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your application settings</p>
        </div>

        <div className="settings-content">
          {/* Sidebar */}
          <aside className="settings-sidebar">
            <nav className="settings-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="settings-main">
            {activeTab === 'general' && (
              <div className="settings-section">
                <h2 className="settings-section-title">General Settings</h2>
                
                <div className="settings-form">
                  <div className="settings-form-group">
                    <label className="settings-label">Site Name</label>
                    <input
                      type="text"
                      value={formData.siteName}
                      onChange={(e) => handleInputChange('siteName', e.target.value)}
                      className="settings-input"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">Site Email</label>
                    <input
                      type="email"
                      value={formData.siteEmail}
                      onChange={(e) => handleInputChange('siteEmail', e.target.value)}
                      className="settings-input"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="settings-select"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">GMT</option>
                    </select>
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="settings-select"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2 className="settings-section-title">Profile Settings</h2>
                
                <div className="settings-form">
                  <div className="settings-form-group">
                    <label className="settings-label">Full Name</label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="settings-input"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">Email Address</label>
                    <input
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="settings-input"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="settings-input"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">Bio</label>
                    <textarea
                      rows={4}
                      defaultValue="System administrator and developer."
                      className="settings-textarea"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2 className="settings-section-title">Notification Settings</h2>
                
                <div className="settings-form">
                  <div className="settings-toggle-group">
                    <div className="settings-toggle-item">
                      <label className="settings-toggle-label">
                        <input
                          type="checkbox"
                          checked={formData.notifications}
                          onChange={(e) => handleInputChange('notifications', e.target.checked)}
                          className="settings-toggle-input"
                        />
                        <span className="settings-toggle-slider"></span>
                        <span className="settings-toggle-text">Email Notifications</span>
                      </label>
                      <p className="settings-toggle-description">Receive email notifications for important updates</p>
                    </div>

                    <div className="settings-toggle-item">
                      <label className="settings-toggle-label">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="settings-toggle-input"
                        />
                        <span className="settings-toggle-slider"></span>
                        <span className="settings-toggle-text">Push Notifications</span>
                      </label>
                      <p className="settings-toggle-description">Receive push notifications in your browser</p>
                    </div>

                    <div className="settings-toggle-item">
                      <label className="settings-toggle-label">
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          className="settings-toggle-input"
                        />
                        <span className="settings-toggle-slider"></span>
                        <span className="settings-toggle-text">SMS Notifications</span>
                      </label>
                      <p className="settings-toggle-description">Receive SMS notifications for critical alerts</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <h2 className="settings-section-title">Security Settings</h2>
                
                <div className="settings-form">
                  <div className="settings-toggle-group">
                    <div className="settings-toggle-item">
                      <label className="settings-toggle-label">
                        <input
                          type="checkbox"
                          checked={formData.twoFactor}
                          onChange={(e) => handleInputChange('twoFactor', e.target.checked)}
                          className="settings-toggle-input"
                        />
                        <span className="settings-toggle-slider"></span>
                        <span className="settings-toggle-text">Two-Factor Authentication</span>
                      </label>
                      <p className="settings-toggle-description">Add an extra layer of security to your account</p>
                    </div>
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">Current Password</label>
                    <input
                      type="password"
                      className="settings-input"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">New Password</label>
                    <input
                      type="password"
                      className="settings-input"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="settings-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h2 className="settings-section-title">Appearance Settings</h2>
                
                <div className="settings-form">
                  <div className="settings-form-group">
                    <label className="settings-label">Theme</label>
                    <div className="settings-theme-options">
                      <label className="settings-theme-option">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={formData.theme === 'light'}
                          onChange={(e) => handleInputChange('theme', e.target.value)}
                          className="settings-theme-input"
                        />
                        <span className="settings-theme-label">Light</span>
                      </label>
                      <label className="settings-theme-option">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={formData.theme === 'dark'}
                          onChange={(e) => handleInputChange('theme', e.target.value)}
                          className="settings-theme-input"
                        />
                        <span className="settings-theme-label">Dark</span>
                      </label>
                      <label className="settings-theme-option">
                        <input
                          type="radio"
                          name="theme"
                          value="auto"
                          checked={formData.theme === 'auto'}
                          onChange={(e) => handleInputChange('theme', e.target.value)}
                          className="settings-theme-input"
                        />
                        <span className="settings-theme-label">Auto</span>
                      </label>
                    </div>
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">Accent Color</label>
                    <div className="settings-color-options">
                      <button className="settings-color-btn settings-color-blue"></button>
                      <button className="settings-color-btn settings-color-green"></button>
                      <button className="settings-color-btn settings-color-purple"></button>
                      <button className="settings-color-btn settings-color-orange"></button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="settings-section">
                <h2 className="settings-section-title">Data & Storage</h2>
                
                <div className="settings-form">
                  <div className="settings-form-group">
                    <label className="settings-label">Default Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="settings-select"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label">Date Format</label>
                    <select
                      value={formData.dateFormat}
                      onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                      className="settings-select"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="settings-danger-zone">
                    <h3 className="settings-danger-title">Danger Zone</h3>
                    <p className="settings-danger-description">These actions are irreversible. Please be careful.</p>
                    
                    <div className="settings-danger-actions">
                      <button className="settings-btn settings-btn-danger">Clear Cache</button>
                      <button className="settings-btn settings-btn-danger">Export Data</button>
                      <button className="settings-btn settings-btn-danger">Delete Account</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="settings-actions">
              <button onClick={handleSave} className="settings-save-btn">
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
