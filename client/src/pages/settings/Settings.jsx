import React from 'react';
import Layout from '../../components/layout/Layout';
import './Settings.css';

const Settings = () => {
  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-header">
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">Manage your account and application preferences</p>
          </div>

          <div className="settings-grid">
            <div className="settings-card">
              <h2 className="settings-card-title">Account</h2>
              <p className="settings-card-text">Update your profile details, email and password.</p>
            </div>
            <div className="settings-card">
              <h2 className="settings-card-title">Notifications</h2>
              <p className="settings-card-text">Control which alerts you receive about activity.</p>
            </div>
            <div className="settings-card">
              <h2 className="settings-card-title">Appearance</h2>
              <p className="settings-card-text">Customize how the dashboard looks and feels.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
