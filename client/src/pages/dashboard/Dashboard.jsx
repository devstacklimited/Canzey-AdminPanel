import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, LayoutDashboard, Settings, Activity } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import './Dashboard.css';

// Components
import Layout from '../../components/layout/Layout';
import StatsCard from './components/StatsCard';
import UsersTable from './components/UsersTable';
import AddUserModal from './components/AddUserModal';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.LIST);
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
      const response = await axios.post(API_ENDPOINTS.USERS.LIST, newUser);
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
        await axios.delete(API_ENDPOINTS.USERS.DELETE(id));
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
    <Layout>
      {/* Page Content */}
      <main className="dashboard-content">
          <div className="dashboard-container">
            {/* Page Title */}
            <div className="dashboard-page-header">
              <h1 className="dashboard-page-title">Dashboard</h1>
              <p className="dashboard-page-subtitle">
                Welcome to Canzey Admin Panel - Manage your users and system
              </p>
            </div>

            {/* Stats Cards */}
            <div className="dashboard-stats-grid">
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
            <div className="dashboard-users-section">
              <div className="dashboard-users-header">
                <h2 className="dashboard-users-title">Users Management</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="dashboard-add-user-btn"
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
              searchTerm={searchTerm}
            />
          </div>
        </main>
    </Layout>
  );
};

export default Dashboard;
