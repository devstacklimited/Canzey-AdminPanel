import React from 'react';
import { LayoutDashboard, Users, Settings, Menu, X, Home, FileText, HelpCircle } from 'lucide-react';

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
      className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-gradient-to-b from-primary-600 to-primary-800 text-white transition-all duration-300 ease-in-out fixed left-0 top-0 bottom-0 z-50 lg:relative lg:translate-x-0`}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between mb-8">
          <h1 className={`font-bold text-xl transition-opacity duration-300 ${!sidebarOpen && 'lg:opacity-0 lg:hidden'}`}>
            Canzey Admin
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                item.active 
                  ? 'bg-primary-700 text-white shadow-lg' 
                  : 'hover:bg-primary-700 text-primary-100 hover:text-white'
              }`}
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span className={`${!sidebarOpen && 'lg:hidden'} transition-all duration-300`}>
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-primary-700">
          <div className={`text-xs text-primary-200 ${!sidebarOpen && 'lg:hidden'}`}>
            <p>Version 1.0.0</p>
            <p>© 2024 Canzey</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
