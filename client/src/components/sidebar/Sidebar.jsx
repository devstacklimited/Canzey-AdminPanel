import React from 'react';
import { LayoutDashboard, Users, Settings, Menu, X, Home, FileText, HelpCircle } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: LayoutDashboard, label: 'Dashboard', active: false },
    { icon: Users, label: 'Users', active: false },
    { icon: FileText, label: 'Reports', active: false },
    { icon: Settings, label: 'Settings', active: false },
    { icon: HelpCircle, label: 'Help', active: false },
  ];

  return (
    <aside
      className={`sidebar ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'} ${sidebarOpen ? 'mobile-open' : ''}`}
    >
      <div className="sidebar-content">
        {/* Logo and Toggle */}
        <div className="sidebar-header">
          <h1 className="sidebar-logo">
            Canzey Admin
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle-btn"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`sidebar-nav-item ${item.active ? 'active' : ''}`}
            >
              <item.icon size={20} className="sidebar-nav-icon" />
              <span className="sidebar-nav-text">
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            <p>Version 1.0.0</p>
            <p>© 2024 Canzey</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
