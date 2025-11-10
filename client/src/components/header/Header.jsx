import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import './Header.css';

const Header = ({ sidebarOpen, searchTerm, setSearchTerm }) => {
  return (
    <header className="header"
            style={{ 
              marginLeft: sidebarOpen ? '16rem' : '5rem',
              width: sidebarOpen ? 'calc(100% - 16rem)' : 'calc(100% - 5rem)'
            }}>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-lg">
            <div className="header-search">
              <Search className="header-search-icon" size={20} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center gap-4 ml-4">
            {/* Notifications */}
            <button className="header-notification-btn">
              <Bell size={20} />
              <span className="header-notification-indicator"></span>
            </button>

            {/* Profile */}
            <div className="header-profile">
              <div className="header-profile-info hidden sm:block">
                <p className="header-profile-name">John Doe</p>
                <p className="header-profile-role">Administrator</p>
              </div>
              <div className="header-profile-avatar">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
                  alt="Profile"
                  className="header-profile-img"
                />
                <span className="header-status-indicator"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
