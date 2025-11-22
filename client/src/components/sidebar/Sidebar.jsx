import React from 'react';
import { Home, Package, Settings, User, Menu, X, ShoppingCart, Ticket, Users, Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: Ticket, label: 'Raffles', path: '/raffles' },
    { icon: Trophy, label: 'Campaigns', path: '/campaigns' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Users, label: 'Canzey Customers', path: '/customers' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <aside
      className="sidebar sidebar-expanded"
    >
      <div className="sidebar-content">
        
        <div className="sidebar-header">
          <h1 className="sidebar-logo">
            Canzey Admin
          </h1>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
            >
              <item.icon size={20} className="sidebar-nav-icon" />
              <span className="sidebar-nav-text">
                {item.label}
              </span>
            </Link>
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