import React from 'react';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import './UsersTable.css';

const UsersTable = ({ users, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="users-table-container">
        <div className="users-table-loading">
          <div className="users-table-loading-spinner"></div>
          Loading users...
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="users-table-container">
        <div className="users-table-empty">
          <p className="users-table-empty-title">No users found</p>
          <p className="users-table-empty-text">Try adjusting your search or add a new user</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-table-container">
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="users-table-id">
                  #{user.id}
                </td>
                <td>
                  <div className="users-table-user-cell">
                    <div className="users-table-avatar">
                      <div className="users-table-avatar-placeholder">
                        <span className="users-table-avatar-text">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="users-table-user-info">
                      <div className="users-table-user-name">
                        {user.name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="users-table-email">
                  {user.email || 'N/A'}
                </td>
                <td>
                  <span className={`users-table-role-badge users-table-role-${user.role || 'user'}`}>
                    {user.role || 'user'}
                  </span>
                </td>
                <td>
                  <span className="users-table-status-badge">
                    Active
                  </span>
                </td>
                <td className="users-table-actions">
                  <div className="users-table-action-buttons">
                    <button
                      onClick={() => onEdit(user)}
                      className="users-table-action-btn users-table-edit-btn"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="users-table-action-btn users-table-delete-btn"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      className="users-table-action-btn users-table-more-btn"
                      title="More"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
