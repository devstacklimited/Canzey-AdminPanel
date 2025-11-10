import React from 'react';
import { X } from 'lucide-react';
import './AddUserModal.css';

const AddUserModal = ({ show, onClose, onSubmit, newUser, setNewUser }) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Add New User</h3>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            <X size={20} className="modal-close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label className="modal-form-label">
              Full Name
            </label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="modal-form-input"
              placeholder="Enter full name"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              Email Address
            </label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="modal-form-input"
              placeholder="user@example.com"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="modal-form-select"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="submit"
              className="modal-btn modal-btn-primary"
            >
              Add User
            </button>
            <button
              type="button"
              onClick={onClose}
              className="modal-btn modal-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
