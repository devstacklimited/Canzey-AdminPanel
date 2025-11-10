import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, LayoutDashboard, Settings, Activity } from 'lucide-react';

// Components
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import StatsCard from '../components/dashboard/StatsCard';
import UsersTable from '../components/dashboard/UsersTable';
import AddUserModal from '../components/dashboard/AddUserModal';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users', newUser);
      if (response.data.success) {
        fetchUsers();
        setShowAddModal(false);
        setNewUser({ name: '', email: '', role: 'user' });
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleEditUser = (user) => {
    // TODO: Implement edit functionality
    console.log('Edit user:', user);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <Header 
          sidebarOpen={sidebarOpen} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />

        {/* Page Content */}
        <main className="pt-20">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome to Canzey Admin Panel - Manage your users and system
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <StatsCard
                title="Total Users"
                value={users.length}
                icon={Users}
                color="primary"
              />
              <StatsCard
                title="Active Sessions"
                value="24"
                icon={Activity}
                color="green"
              />
              <StatsCard
                title="System Status"
                value="Online"
                icon={LayoutDashboard}
                color="purple"
              />
              <StatsCard
                title="Admin Users"
                value={users.filter(u => u.role === 'admin').length}
                icon={Settings}
                color="red"
              />
            </div>

            {/* Users Management Section */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">Users Management</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <Plus size={20} />
                  Add User
                </button>
              </div>
            </div>

            {/* Users Table */}
            <UsersTable
              users={filteredUsers}
              loading={loading}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          </div>
        </main>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        newUser={newUser}
        setNewUser={setNewUser}
      />
    </div>
  );
};

export default Dashboard;
