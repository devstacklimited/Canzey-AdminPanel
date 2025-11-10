import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Header = ({ sidebarOpen, searchTerm, setSearchTerm }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 z-40 transition-all duration-300"
            style={{ marginLeft: sidebarOpen ? '16rem' : '5rem' }}>
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center gap-4 ml-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80"
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-primary-500 transition-colors cursor-pointer"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
