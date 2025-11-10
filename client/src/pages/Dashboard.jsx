import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  LayoutDashboard,
  Settings,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Search
} from 'lucide-react';

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-primary-600 to-primary-800 text-white transition-all duration-300 ease-in-out`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>
              Canzey Admin Panel
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="space-y-2">
            <a
              href="#"
              className="flex items-center gap-3 p-3 rounded-lg bg-primary-700 hover:bg-primary-600 transition-colors"
            >
              <LayoutDashboard size={20} />
              <span className={`${!sidebarOpen && 'hidden'}`}>Dashboard</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Users size={20} />
              <span className={`${!sidebarOpen && 'hidden'}`}>Users</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Settings size={20} />
              <span className={`${!sidebarOpen && 'hidden'}`}>Settings</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-600">Welcome to Canzey Admin Panel</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800">{users.length}</p>
                </div>
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Users className="text-primary-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Sessions</p>
                  <p className="text-3xl font-bold text-gray-800">24</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <LayoutDashboard className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">System Status</p>
                  <p className="text-3xl font-bold text-green-600">Online</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Settings className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Users Management</h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={20} />
                  Add User
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No users found</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button className="text-primary-600 hover:text-primary-900 transition-colors">
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Add New User</h3>
            <form onSubmit={handleAddUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
