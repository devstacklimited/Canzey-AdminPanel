import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useUser } from '../../context/UserContext';
import { Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import './Users.css';

const Users = () => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, admin, customer
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, suspended
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch admins
      const adminRes = await fetch('http://localhost:5000/api/admin/userinfo', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch customers
      const customerRes = await fetch('http://localhost:5000/api/customer/info', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const allUsers = [];
      
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        if (adminData.user) {
          allUsers.push({ ...adminData.user, userType: 'admin' });
        }
      }
      
      if (customerRes.ok) {
        const customerData = await customerRes.json();
        if (customerData.user) {
          allUsers.push({ ...customerData.user, userType: 'customer' });
        }
      }

      setUsers(allUsers);
      applyFilters(allUsers, searchTerm, filterType, filterStatus);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = (userList, search, type, status) => {
    let filtered = userList;

    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter(u => u.userType === type);
    }

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(u => u.status === status);
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(u =>
        u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.id?.toString().includes(search)
      );
    }

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters(users, searchTerm, filterType, filterStatus);
  }, [searchTerm, filterType, filterStatus, users]);

  const handleDelete = async (userId, userType) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      console.log(`Delete ${userType} user ${userId}`);
      // TODO: Implement delete functionality
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'suspended':
        return 'status-suspended';
      default:
        return '';
    }
  };

  const getTypeColor = (type) => {
    return type === 'admin' ? 'type-admin' : 'type-customer';
  };

  return (
    <Layout>
      <div className="users-container">
        <div className="users-header">
          <h1>Users Management</h1>
          <p>View and manage all admin and customer users</p>
        </div>

        {/* Filters */}
        <div className="users-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <Filter size={20} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="admin">Admins</option>
              <option value="customer">Customers</option>
            </select>
          </div>

          <div className="filter-group">
            <Filter size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="no-users">No users found</div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={`${u.userType}-${u.id}`}>
                    <td className="user-id">#{u.id}</td>
                    <td className="user-name">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="user-email">{u.email}</td>
                    <td>
                      <span className={`badge ${getTypeColor(u.userType)}`}>
                        {u.userType === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(u.status)}`}>
                        {u.status === 'active' && <CheckCircle size={14} />}
                        {u.status === 'inactive' && <XCircle size={14} />}
                        {u.status === 'suspended' && <XCircle size={14} />}
                        {u.status}
                      </span>
                    </td>
                    <td className="user-action">
                      <button 
                        className="detail-btn"
                        onClick={() => {
                          setSelectedUser(u);
                          setShowDetailDialog(true);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats */}
        <div className="users-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{users.length}</p>
          </div>
          <div className="stat-card">
            <h3>Admins</h3>
            <p className="stat-number">{users.filter(u => u.userType === 'admin').length}</p>
          </div>
          <div className="stat-card">
            <h3>Customers</h3>
            <p className="stat-number">{users.filter(u => u.userType === 'customer').length}</p>
          </div>
          <div className="stat-card">
            <h3>Active</h3>
            <p className="stat-number">{users.filter(u => u.status === 'active').length}</p>
          </div>
        </div>

        {/* Detail Dialog */}
        {showDetailDialog && selectedUser && (
          <div className="detail-dialog-overlay" onClick={() => setShowDetailDialog(false)}>
            <div className="detail-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="detail-dialog-header">
                <h2>User Details</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowDetailDialog(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="detail-dialog-content">
                <div className="detail-row">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">#{selectedUser.id}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedUser.first_name} {selectedUser.last_name}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedUser.email}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedUser.phone_number || 'N/A'}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className={`badge ${getTypeColor(selectedUser.userType)}`}>
                    {selectedUser.userType === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`badge ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Joined:</span>
                  <span className="detail-value">
                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                {selectedUser.last_login && (
                  <div className="detail-row">
                    <span className="detail-label">Last Login:</span>
                    <span className="detail-value">
                      {new Date(selectedUser.last_login).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {selectedUser.userType === 'admin' && selectedUser.role && (
                  <div className="detail-row">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">{selectedUser.role}</span>
                  </div>
                )}
              </div>
              
              <div className="detail-dialog-footer">
                <button 
                  className="close-dialog-btn"
                  onClick={() => setShowDetailDialog(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Users;
