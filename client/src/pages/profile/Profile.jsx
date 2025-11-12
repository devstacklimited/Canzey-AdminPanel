import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useUser } from '../../context/UserContext';
import ProfileTabs from './components/ProfileTabs';
import ProfileInfo from './components/ProfileInfo';
import UserManagement from './components/UserManagement';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (user?.first_name || user?.last_name) {
      const initials = [user.first_name?.[0], user.last_name?.[0]].filter(Boolean).join('');
      return initials.toUpperCase() || 'U';
    }
    if (name) {
      return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  const [tempData, setTempData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    company: user?.company || '',
    job_title: user?.job_title || '',
  });

  // Fetch all users for admin
  const fetchAllUsers = async () => {
    console.log('🔄 fetchAllUsers called');
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Fetch users response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📥 Users API response:', result);
        
        // Handle both old format (array) and new format (object with data property)
        const users = result.data || result;
        console.log('👥 Processed users:', users);
        console.log('👥 Users count:', Array.isArray(users) ? users.length : 'NOT_ARRAY');
        
        if (Array.isArray(users)) {
          users.forEach((user, index) => {
            console.log(`👤 User ${index + 1}:`, {
              id: user.id,
              name: user.display_name || [user.first_name, user.last_name].filter(Boolean).join(' '),
              status: user.status,
              role: user.role
            });
          });
        }
        
        setAllUsers(Array.isArray(users) ? users : []);
        console.log('✅ Users state updated');
      } else {
        console.error('❌ Failed to fetch users:', response.status, response.statusText);
        setAllUsers([]);
      }
    } catch (error) {
      console.error('💥 Error fetching users:', error);
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
      console.log('🏁 fetchAllUsers completed');
    }
  };

  // Handle user status changes
  const handleUserAction = async (userId, newStatus) => {
    console.log('🔥 handleUserAction called in Profile.jsx:', { userId, newStatus });
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      const requestBody = { status: newStatus };
      console.log('📤 Request details:', {
        url: `http://localhost:5000/api/users/${userId}`,
        method: 'PUT',
        body: requestBody,
        headers: {
          'Authorization': token ? 'Bearer [TOKEN_EXISTS]' : 'NO_TOKEN',
          'Content-Type': 'application/json'
        }
      });
      
      // Use the general update endpoint to change status
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📥 Response status:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('📥 Response body:', result);
      
      if (response.ok) {
        console.log('✅ Status updated successfully, refreshing users...');
        // Small delay to ensure database update is complete
        setTimeout(() => {
          fetchAllUsers(); // Refresh users list
        }, 500);
      } else {
        console.error('❌ Failed to update status:', result);
        alert(`Failed to update user status: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Error updating user status:', error);
      alert('Error updating user status. Please try again.');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'users') {
      fetchAllUsers();
    }
  }, [activeTab, user?.role]);

  const handleEdit = () => {
    setTempData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      company: user?.company || '',
      job_title: user?.job_title || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        alert('Please login again');
        return;
      }

      console.log('Saving profile data:', tempData);
      
      // Update profile in database
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: tempData.first_name,
          last_name: tempData.last_name,
          phone: tempData.phone,
          location: tempData.location,
          bio: tempData.bio,
          website: tempData.website,
          company: tempData.company,
          job_title: tempData.job_title
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        // Update user context with new data
        updateUser(data.user);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        console.error('Error updating profile:', data.message);
        alert('Error updating profile: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setTempData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div className="profile-container">
      

        {/* Tabs */}
        <ProfileTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={user?.role}
        />

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <ProfileInfo
            user={user}
            isEditing={isEditing}
            tempData={tempData}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onLogout={logout}
            onInputChange={handleInputChange}
            getUserInitials={getUserInitials}
          />
        )}
          
        {/* User Management Tab */}
        {activeTab === 'users' && user?.role === 'admin' && (
          <UserManagement
            allUsers={allUsers}
            loadingUsers={loadingUsers}
            onUserAction={handleUserAction}
            getUserInitials={getUserInitials}
            onRefreshUsers={fetchAllUsers}
          />
        )}
      </div>
    </Layout>
  );
};

export default Profile;
