import React, { useState, useEffect } from 'react';
import { Users, Eye, AlertTriangle, ChevronDown } from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';
import './UserManagement.css';

const UserManagement = ({ 
  allUsers = [], 
  loadingUsers = false, 
  onUserAction = () => {}, 
  getUserInitials = () => 'U',
  onRefreshUsers = () => {}
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);

  const statusOptions = [
    { value: 'approved', label: 'Approved', color: '#10b981' },
    { value: 'pending', label: 'Pending', color: '#f59e0b' },
    { value: 'hold', label: 'Hold', color: '#ef4444' }
  ];

  // Add error boundary and debugging
  console.log('UserManagement props:', { allUsers, loadingUsers });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.status-dropdown-container')) {
        setShowStatusDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
    setShowStatusDropdown(null);
  };

  const handleStatusChange = (user, newStatus) => {
    console.log('🔄 handleStatusChange called:', {
      userId: user.id,
      currentStatus: user.status,
      newStatus: newStatus,
      userName: user.display_name || [user.first_name, user.last_name].filter(Boolean).join(' ')
    });

    if (user.status === newStatus) {
      console.log('⚠️ Status is the same, no change needed');
      setShowStatusDropdown(null);
      return;
    }

    const statusLabel = statusOptions.find(s => s.value === newStatus)?.label || newStatus;
    console.log('✅ Setting confirmation dialog:', { statusLabel });
    
    setShowConfirmDialog({
      user,
      action: newStatus,
      title: `Change Status to ${statusLabel}`,
      message: `Are you sure you want to change ${user.display_name || [user.first_name, user.last_name].filter(Boolean).join(' ')}'s status to ${statusLabel}?`
    });
    setShowStatusDropdown(null);
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[1]; // Default to pending
  };

  const confirmAction = async () => {
    if (showConfirmDialog) {
      console.log('🚀 confirmAction called:', {
        userId: showConfirmDialog.user.id,
        action: showConfirmDialog.action
      });
      
      try {
        await onUserAction(showConfirmDialog.user.id, showConfirmDialog.action);
        console.log('✅ onUserAction completed successfully');
        setShowConfirmDialog(null);
        onRefreshUsers();
        console.log('🔄 Refreshing users list...');
      } catch (error) {
        console.error('❌ Error in confirmAction:', error);
      }
    } else {
      console.log('⚠️ No confirmation dialog to process');
    }
  };

  const handleUpdateUser = (updatedUser) => {
    // Update the user in the list
    onRefreshUsers();
    setShowDetailsModal(false);
  };

  return (
    <div className="user-management-content">
      <div className="user-management-header">
        <h2 className="user-management-title">
          <Users size={24} />
          User Management
        </h2>
        <p className="user-management-subtitle">
          Manage staff and manager accounts
        </p>
      </div>

      {loadingUsers ? (
        <div className="loading-users">Loading users...</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(allUsers) && allUsers.filter(u => u && u.role !== 'admin').map((userData) => (
                <tr key={userData.id} className="user-row">
                  <td className="user-cell">
                    <div className="user-info-cell">
                      <div className="user-avatar-small">
                        {userData.avatar ? (
                          <img src={userData.avatar} alt="Avatar" />
                        ) : (
                          <div className="avatar-placeholder-small">
                            {getUserInitials(userData.display_name || [userData.first_name, userData.last_name].filter(Boolean).join(' '))}
                          </div>
                        )}
                      </div>
                      <span className="user-name-cell">
                        {userData.display_name || [userData.first_name, userData.last_name].filter(Boolean).join(' ') || 'Unknown User'}
                      </span>
                    </div>
                  </td>
                  <td className="role-cell">
                    <span className={`role-badge-small ${userData.role}`}>
                      {userData.role}
                    </span>
                  </td>
                  <td className="status-cell">
                    <span 
                      className="status-badge-display" 
                      style={{ backgroundColor: getStatusInfo(userData.status).color }}
                    >
                      {getStatusInfo(userData.status).label}
                    </span>
                  </td>
                  <td className="details-cell">
                    <button
                      className="detail-btn"
                      onClick={() => handleViewDetails(userData)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                  <td className="actions-cell">
                    <div className="status-dropdown-container">
                      <button
                        className="status-dropdown-trigger"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Status dropdown clicked for user:', userData.id, 'Current dropdown:', showStatusDropdown);
                          setShowStatusDropdown(showStatusDropdown === userData.id ? null : userData.id);
                        }}
                        style={{ backgroundColor: getStatusInfo(userData.status).color }}
                      >
                        <span>{getStatusInfo(userData.status).label}</span>
                        <ChevronDown size={14} />
                      </button>
                      
                      {showStatusDropdown === userData.id && (
                        <div className="status-dropdown-menu">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              className={`status-dropdown-item ${userData.status === option.value ? 'active' : ''}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🎯 Dropdown item clicked:', {
                                  optionValue: option.value,
                                  optionLabel: option.label,
                                  userId: userData.id,
                                  currentStatus: userData.status
                                });
                                handleStatusChange(userData, option.value);
                              }}
                              style={{ 
                                color: option.color,
                                backgroundColor: userData.status === option.value ? `${option.color}15` : 'transparent'
                              }}
                            >
                              {option.label}
                              {userData.status === option.value && <span className="checkmark">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!Array.isArray(allUsers) || allUsers.filter(u => u && u.role !== 'admin').length === 0) && (
            <div className="no-users">
              <Users size={48} />
              <p>No users found</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="confirmation-overlay" onClick={() => setShowConfirmDialog(null)}>
          <div className="confirmation-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirmation-header">
              <AlertTriangle size={24} className="warning-icon" />
              <h3>{showConfirmDialog.title}</h3>
            </div>
            <div className="confirmation-body">
              <p>{showConfirmDialog.message}</p>
            </div>
            <div className="confirmation-actions">
              <button 
                onClick={() => setShowConfirmDialog(null)}
                className="btn-cancel-confirm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                className="btn-confirm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
};

export default UserManagement;
