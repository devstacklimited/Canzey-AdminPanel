import React from 'react';
import { User, Users } from 'lucide-react';
import './ProfileTabs.css';

const ProfileTabs = ({ activeTab, setActiveTab, userRole }) => {
  return (
    <div className="profile-tabs">
      <button 
        className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        <User size={18} />
        Profile
      </button>
      
      {userRole === 'admin' && (
        <button 
          className={`profile-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          User Management
        </button>
      )}
    </div>
  );
};

export default ProfileTabs;
